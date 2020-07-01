import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, ValidatorFn } from '@angular/forms';
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
    siteId: Joi.string().pattern(/^[a-zA-Z]{2}[0-9]{1,3}$/).message('Site ID must contain two letters and one to three digits. Example "AB123"'),

    // Add an array of affected persons. The the person's
    // name cannot be too short or too long
    affected: Joi.array().items(Joi.string().min(3).max(24)).messages({
      'string.min': 'This field needs to contain at least {#limit} characters',
      'string.max': 'This field can contain no more than {#limit} characters'
    })
  });

  incidentForm = this.fb.group({
    type: [this.types[2]],
    title: ['Something went wrong'],
    description: ['Here is what happened in great detail'],
    siteId: ['UX123'],
    // add an array to the form
    affected: this.fb.array([])
  }, {
    validators: this.createValidatorFromSchema(this.incidentSchema)
  });

  get affected(): FormArray {
    return this.incidentForm.get('affected') as FormArray;
  }

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

  onAddAffectedClick(): void {
    this.affected.push(this.fb.control(''));
  }

}
