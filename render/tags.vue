<template>
  <ul>
    <li v-for="tag in tags" :key="tag">{{ tag.label || tag.name }} <em v-if="tag.value">[{{ tag.value }}]</em> </li>
  </ul>
</template>

<script lang="ts">

export default {
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
    tags () {
      if (this.field.list) {
        return this.field.list.filter(o => this.value.includes(o.value))
      }
      else {
        return this.value.map(v => ({ label: v}))
      }
    }
  }
};
</script>