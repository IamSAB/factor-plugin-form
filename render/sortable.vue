<template>
  <div>
    <div v-for="v in value" :key="v.__key" style="margin-bottom: 1rem; padding: 0 0.5rem; border-left: 2px solid lightgray;">
      <b>{{ v.__title }}</b>
      <div v-for="(s, i) in field.settings" :key="i" style="padding: 0.5rem 0 0 0.5rem;">
        <b>{{ s.label }}</b>
        <div>
          <component v-if="isChildComponent(s.input) && s._id in v" :is="s.input" :value="v[s._id]" :field="s" />
          <span v-else>{{ s._id in v ? v[s._id] : '-' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { setting } from "@factor/api";

export default {
  components: setting("form.fields.render"),
  props: {
    value: {
      type: Array,
      required: true
    },
    field: {
      type: Object,
      required: true
    }
  },
  computed: {
    items() {
      return this.field.settings.map((setting, i) => {});
    }
  },
  methods: {
    isChildComponent(this: any, component: string) {
      return Object.keys(this.$options.components).includes(component);
    }
  }
};
</script>