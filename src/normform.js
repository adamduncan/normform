'use strict';

const normform = (function () {

  const formSelector = '.js-normform';
  const validationFeedbackAttr = 'data-normform-feedback-for';
  const validationErrorMsgAttr = 'data-normform-error-message';
  const validateOnSumbitAttr = 'data-normform-async';
  const validClass = 'normform-valid';
  const invalidClass = 'normform-invalid';
  const hasBlurredProp = 'normformHasBlurred';
  const hasKeyedProp = 'normformHasKeyed';
  const hasAttemptedSubmitProp = 'normformHasAttemptedSubmit';
  const hasSubmittedProp = 'normformHasSubmitted';

  const myForms = [].slice.call(document.querySelectorAll(formSelector));

  // INIT
  myForms.forEach((formEl) => {
    if (formEl.getAttribute(validateOnSumbitAttr) !== 'false') bindFormEvents(formEl);
    bindFormSubmitClick(formEl);
    formEl[hasAttemptedSubmitProp] = false;
    formEl[hasSubmittedProp] = false;
  });

  return myForms;


  // BINDINGS
  function bindFormEvents(formEl) {
    const handledFields = [].slice.call(formEl.elements)
      .filter(formField => needsValidating(formField))
      .map(formField => bindFieldEvents(formField));
  }

  function bindFieldEvents(formField) {
    // bind property to suppress first time check
    formField[hasBlurredProp] = false;
    formField[hasKeyedProp] = false;
    // handle blur
    formField.addEventListener('blur', fieldBlurHandler);
    // handle change/keyup
    formField.addEventListener('keyup', fieldKeyupChangeHandler);
    formField.addEventListener('change', fieldKeyupChangeHandler);

    return formField;
  }

  function bindFormSubmitClick(formEl) {
    // bind on click instead of sumbit, as won't be called until validation passes
    formEl.querySelector('[type="submit"]').addEventListener('click', formSubmitHandler);
  }


  // HANDLERS
  function fieldBlurHandler(e) {
    const formField = e.currentTarget || e.target;
    
    formField[hasBlurredProp] = true;
    if (formField[hasKeyedProp]) {
      validateField(formField);
    }
  }

  function fieldKeyupChangeHandler(e) {
    const formField = e.currentTarget || e.target;
    const isTabOrShiftKey = e.keyCode === 9 || e.keyCode === 16;
    
    if (isTabOrShiftKey) return;
    if ((formField[hasBlurredProp] && formField[hasKeyedProp]) || formField.form[hasAttemptedSubmitProp]) {
      validateField(formField);
    }
    formField[hasKeyedProp] = true;
  }

  function formSubmitHandler(e) {
    const formEl = e.currentTarget.form;
    validateForm(formEl);
    // returning focus to first invalid field in form for now
    // will replace this with shifting focus to form summary when complete
    // http://files.paciellogroup.com/training/commonsamples//validation_feedback/index.html
    returnFocusToFirstInvalid(formEl);
    // bind key/blur events if form submission attempt already made
    if (!formEl[hasAttemptedSubmitProp]) bindFormEvents(formEl);
    formEl[hasAttemptedSubmitProp] = true;
    e.preventDefault();
  }


  // ACTIONS
  function validateForm(formEl) {
    // should be able to formEl.checkValidity() here, but a set of required checkbox/radio inputs gives false negative
    // if (!formEl.checkValidity()) {
    const validatedFields = [].slice.call(formEl.elements).filter(formField => needsValidating(formField)).map(formField => validateField(formField));
    const invalidFields = validatedFields.filter(formField => !isFieldValid(formField));
    // instead manually check for invalids before submitting
    if (!invalidFields.length) submitForm(formEl);
    // }
  }

  function submitForm(formEl) {
    formEl[hasSubmittedProp] = true;
    if (!demoMode) formEl.submit();
  }

  function validateField(formField) {
    toggleValidity(formField);
    updateValidationMsg(formField);
    // treat as already tested
    formField[hasBlurredProp] = true;
    formField[hasKeyedProp] = true;
    return formField;
  }

  function toggleValidity(formField) {
    // toggle valid/invalid classes on parent if checkbox/radio set, otherwise input itself
    const targetEl = (isPartOfToggleSet(formField)) ? formField.form.querySelector(`[for="${formField.id}"]`).parentNode : formField;
    if (!isFieldValid(formField)) {
      formField.setAttribute('aria-invalid', true);
      targetEl.classList.add(invalidClass);
      targetEl.classList.remove(validClass);
    } else {
      formField.removeAttribute('aria-invalid');
      targetEl.classList.add(validClass);
      targetEl.classList.remove(invalidClass);
    }
  }

  function updateValidationMsg(formField) {
    const thisForm = formField.form;
    const inputId = (isPartOfToggleSet(formField)) ? formField.getAttribute('name') : formField.getAttribute('id');
    const validationEl = thisForm.querySelector(`[${validationFeedbackAttr}="${inputId}"]`);
    const validationMsg = (!isFieldValid(formField)) ? validationEl.getAttribute(validationErrorMsgAttr) || formField.validationMessage : '';
    // keep validation text and custom validity in sync
    if (validationEl) validationEl.textContent = validationMsg;
    // formField.setCustomValidity(validationMsg);
  }

  function returnFocusToFirstInvalid(formEl) {
    const invalidFields = [].slice.call(formEl.elements).filter(formField => needsValidating(formField)).filter(formField => !isFieldValid(formField));
    if (invalidFields.length) {
      invalidFields[0].focus();
    }
  }


  // HELPERS
  function hasPattern(formField) {
    return formField.hasAttribute('pattern');
  }

  function isFieldRequired(formField) {
    return formField.hasAttribute('required') || formField.hasAttribute('aria-required');
  }

  function needsValidating(formField) {
    return formField.willValidate && formField.getAttribute('type') !== 'submit';
  }

  function isFieldValid(formField) {
    return !![].slice.call(formField.form.querySelectorAll(`[name="${formField.getAttribute('name')}"]`)).filter(formField => formField.validity.valid).length;
  }

  function isPartOfToggleSet(formField) {
    const formFieldType = formField.getAttribute('type');
    return formFieldType === 'checkbox' || formFieldType === 'radio';
  }

})();

// export default normform;