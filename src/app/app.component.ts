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
    type: Joi.any()
    // Add conditional validation:
    .when('siteId',
      {
        is: 'AB123',
        then: Joi.valid('Major'),
        otherwise: Joi.valid('Lethal', 'Major', 'Minor')
      }
    ),
    title: Joi.string().required().min(5).max(32),
    description: Joi.string().required().min(20),
    // Add a human friendly message to display if
    // the Site ID does not pass validation
    siteId: Joi.string().pattern(/^[a-zA-Z]{2}[0-9]{1,3}$/).message('Site ID must contain two letters and one to three digits. Example "AB123"')
  });

  incidentForm = this.fb.group({
    type: [this.types[2]],
    title: ['A problem occurred'],
    description: ['A longer description of the problem'],
    siteId: ['AB122']
  }, {
    // Adding a validator to the whole form.
    validators: this.createValidatorFromSchema(this.incidentSchema)
  });

  constructor(private fb: FormBuilder) {}

  private createValidatorFromSchema(schema): ValidatorFn {
    const validator: ValidatorFn = (group: FormGroup) => {
      // Remove error from controls
      for (const key in group.controls) {
        const control = group.get(key);
        if (control.errors) {
          control.setErrors(null);
        }
      }

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

  getError(formControlName: string, options = { checkPristine: false } ): string {
    let preflight;

    if (options.checkPristine) {
      preflight = true;
    } else {
      preflight = !this.incidentForm.get(formControlName).pristine
    }

    if (
      preflight &&
      this.incidentForm.errors
    ) {
        return this.incidentForm.errors[formControlName];
    }
    return;
  }
}
