import { Component } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn } from '@angular/forms';
import * as Joi from '@hapi/joi';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'joi-validation';
  types = ['Lethal', 'Major', 'Minor'];

  incidentSchema = Joi.object({
    type: Joi.any().valid('Lethal', 'Major', 'Minor'),
    title: Joi.string().required().min(5).max(32),
    description: Joi.string().required().min(20),
    siteId: Joi.string().pattern(/^[a-zA-Z]{2}[0-9]{1,3}$/)
  });

  incidentForm = this.fb.group({
    type: [this.types[2]],
    title: [''],
    description: [''],
    siteId: ['']
  }, { 
    // Adding a validator to the whole form.
    validators: this.createValidatorFromSchema(this.incidentSchema)
  });

  constructor(private fb: FormBuilder) {}

  private createValidatorFromSchema(schema): ValidatorFn {
    const validator: ValidatorFn = (group: FormGroup) => {
      // This is where the validation on the values of
      // the form group is run.
      const result = schema.validate(group.value);

      if (result.error) {
        const errorObj = result.error.details.reduce((acc, current) => {
          const key = current.path.join('.');
          acc[key] = current.message;
          return acc;
        }, {})

        // Set error value on each control
        for (const key in errorObj) {
          const control = group.get(key);
          if (control) {
            control.setErrors({ [key]: errorObj[key] });
          }
        }

        // Return the error object so that we can access
        // the form’s errors via `form.errors`. 
        return errorObj;
      } else {
        return null;
      }
    };

    return validator;
  }

  getError(formControlName: string): string {
    if (
      !this.incidentForm.get(formControlName).pristine &&
      this.incidentForm.errors
    ) {
        return this.incidentForm.errors[formControlName];
    }
    return;
  }
}
