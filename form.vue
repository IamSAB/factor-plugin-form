<template>
  <div class="submission">
    <factor-form
      v-show="formStatus < FormStatus.Submitted"
      ref="form"
      class="form"
      :class="formStatus"
      @submit="submit()"
    >
      <div class="inputs">
        <factor-input-wrap
          v-if="emailConfirmation"
          input="factor-input-email"
          v-model="values.email"
          :required="true"
          v-bind="setting('form.fields.email')"
        />
        <factor-input-wrap
          v-for="(input, i) in inputs"
          :key="i"
          :data-test="`form-${input._id}`"
          v-bind="input"
          v-model="values[input._id]"
        />
        <factor-input-submit btn="primary">
          <slot name="submit">Submit</slot>
        </factor-input-submit>
      </div>
    </factor-form>
    <div v-show="formStatus > FormStatus.Submitted">
      <div ref="email">
        <slot name="email-header"></slot>
        <render-fields ref="email" :values="values" :fields="inputs" />
        <slot name="email-footer"></slot>
      </div>
      <div class="submission-progress">
        <div v-if="formStatus < FormStatus.Success">
          <factor-spinner width="2rem" color-mode="text"/>
          <slot v-if="formStatus == FormStatus.Saving" name="save">Saving submission</slot>
          <slot
            v-else-if="formStatus == FormStatus.Confirming"
            name="confirm"
          >Sending confirmation email</slot>
          <slot v-else-if="formStatus == FormStatus.Notifying" name="notify">Notifying key people</slot>
        </div>
        <slot v-else name="success">Successful submission. Thank you.</slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  factorInputWrap,
  factorForm,
  factorInputSubmit,
  factorSpinner
} from "@factor/ui";
import { setting, timeUtil } from "@factor/api";
import { saveForm, sendFormEmail } from ".";

const renderFields = setting("form.email.render");

enum FormStatus {
  Unchecked,
  Invalid,
  Valid,
  Submitted,
  Saving,
  Confirming,
  Notifying,
  Success
}

export default {
  components: {
    factorInputWrap,
    factorForm,
    factorInputSubmit,
    factorSpinner,
    renderFields
  },
  props: {
    fields: {
      type: Array,
      default: () => setting("form.fields.default")
    },
    emailConfirmation: {
      type: Boolean,
      default: true
    },
    notifyTo: {
      type: String,
      default: () => setting("form.email.notifyTo")
    },
    title: {
      type: String,
      default: () => setting("form.email.title")
    }
  },
  data() {
    return {
      FormStatus,
      formStatus: FormStatus.Unchecked,
      values: {
        email: ""
      }
    };
  },
  mounted() {
    window.timeUtil = timeUtil
    this.$watch(
      "values",
      function(this: any) {
        const v = this.$refs.form.$el.checkValidity();
        this.formStatus = v ? FormStatus.Valid : FormStatus.Invalid;
      },
      { deep: true, immediate: true }
    );
  },
  computed: {
    inputs() {
      return this.fields.map(f => ({
        ...f,
        label: this.getLabel(f),
        input: `factor-input-${f.input}`
      }));
    }
  },
  methods: {
    setting,
    async submit(this: any) {
      this.formStatus = FormStatus.Submitted;

      const content = this.$refs.email.innerHTML;

      this.formStatus = FormStatus.Saving;
      await saveForm(content, this.values);

      if (this.emailConfirmation) {
        this.formStatus = FormStatus.Confirming;
        await sendFormEmail(this.values.email, this.title, content, this.values);
      }

      if (this.notifyTo) {
        this.formStatus = FormStatus.Notifying;
        await sendFormEmail(this.notifyTo, this.title, content, this.values);
      }
      this.formStatus = FormStatus.Success
    },
    getLabel(c: any): string {
      const label = [c.label];
      if (c.required && c.label) {
        label.push("*");
      }
      return label.join(" ");
    }
  }
};
</script>
<style lang="postcss">
.submission {
  .submission-progress {
    text-align: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
    .factor-spinner {
      margin-bottom: 0.5rem;
    }
  }
}
</style>