<template>
  <div v-formatted-text="markdown" />
</template>

<script lang="ts">
import { renderMarkdown } from "@factor/api/markdown";

export default {
  props: {
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    markdown() {
      return renderMarkdown(this.value);
    }
  }
};
</script>