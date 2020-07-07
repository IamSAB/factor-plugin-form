<template>
  <div class="sortable-input">
    <div class="sortable-items">
      <div ref="organizer" class="controls">
        <div
          v-for="(item, i) in localValue"
          :key="item._id"
          class="sortable-item"
          :class="i == selected ? 'active' : 'inactive'"
          @click="selected = i"
        >
          <div class="handle">
            <span>{{ item.label || `Field ${selected}` }}</span>
            <factor-icon icon="fas fa-grip-horizontal" />
          </div>
        </div>

        <factor-btn class="add-item" @click="addField()">
          Add Field
          <factor-icon icon="fas fa-plus" />
        </factor-btn>
      </div>

      <div v-if="localValue.length" class="inputs">
        <div class="header">
          <div class="title">
            <input
              class="title-input"
              :value="getValue('_id')"
              type="text"
              :placeholder="`Identifier`"
              :size="getValue('_id') ? getValue('_id').length + 2 : 8"
              @input="setValue('_id', $event.target.value)"
            />
            <span class="edit-me">
              <factor-icon icon="fas fa-pencil-alt" />
            </span>
          </div>
          <div>
            <factor-btn size="small" @click="removeField(selected)">
              Remove Field
              <factor-icon icon="fas fa-trash" />
            </factor-btn>
          </div>
        </div>
        <factor-input-wrap
          input="factor-input-select"
          :value="getValue('input')"
          :data-test="`input-input-${selected + 1}`"
          :list="inputTypeOptions"
          label="Input Type"
          placeholder="Select input type"
          @input="setValue('input', $event)"
        />

        <factor-input-wrap
          input="factor-input-text"
          :value="getValue('label')"
          :data-test="`input-label-${selected + 1}`"
          label="Label"
          @input="setValue('label', $event)"
          @change="setIdentifier($event.target.value)"
        />
        <factor-input-wrap
          input="factor-input-textarea"
          :value="getValue('description')"
          :data-test="`input-description-${selected + 1}`"
          label="Description"
          @input="setValue('description', $event)"
        />
        <factor-input-wrap
          v-for="field in inputAttrFields"
          v-show="field.show"
          :key="field.name"
          :value="getValue(field.name)"
          :data-test="`input-${field.name}-${selected + 1}`"
          v-bind="field"
          @input="setValue(field.name, $event)"
        />
        <factor-input-wrap
          :input="`factor-input-${getValue('input')}`"
          :value="getValue('_default')"
          :data-test="`input-default-${selected + 1}`"
          :list="getValue('list') || []"
          :settings="getValue('settings') || []"
          label="Default"
          @input="setValue('_default', $event)"
        />
        <factor-input-checkbox
          :value="getValue('required')"
          @input="setValue('required', $event)"
          label="Required"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  factorBtn,
  factorIcon,
  factorInputWrap,
  factorInputCheckbox
} from "@factor/ui";
import { randomToken } from "@factor/api/utils";
import DOM from "jquery";
import Sortable from "sortablejs";
import { camelCase, startCase } from "lodash-es";

import { inputTypes, inputAttrs } from "./template";

export default {
  components: {
    factorBtn,
    factorIcon,
    factorInputWrap,
    factorInputCheckbox
  },
  props: {
    value: { type: [Array, Object], default: () => [] },
    settings: { type: Array, default: () => [] }
  },
  data() {
    return {
      selected: 0,
      inputAttrs
    };
  },
  computed: {
    localValue: {
      get(this: any) {
        return this.ensure(this.value);
      },
      set(this: any, localValue: any) {
        this.$emit("input", localValue);
      }
    },
    inputTypeOptions() {
      return inputTypes.map(t => {
        return {
          label: t.label || startCase(t.name),
          value: t.name
        };
      });
    },
    selectedInputType() {
      const name = this.getValue("input");
      return inputTypes.find(t => {
        return t.name == name;
      });
    },
    inputAttrFields() {
      return inputAttrs.map(attr => {
        return {
          ...attr,
          input: `factor-input-${attr.input}`,
          show: this.selectedInputType.attrs.includes(attr.name)
        };
      });
    }
  },
  mounted() {
    this.sortItems();
  },
  methods: {
    // keys are required for drag and drop
    ensure(v: any[]) {
      return v.map(_ => {
        if (!_.__key) {
          _.__key = randomToken(4);
        }
        return _;
      });
    },
    sortItems(this: any) {
      Sortable.create(this.$refs.organizer, {
        filter: ".ignore-sortable",
        ghostClass: "sortable-ghost",
        onUpdate: e => {
          const newLocalValue = this.localValue.slice();
          if (e.oldIndex && newLocalValue[e.oldIndex]) {
            const moved = newLocalValue.splice(e.oldIndex, 1);
            newLocalValue.splice(e.newIndex, 0, moved[0]);

            this.localValue = newLocalValue;
            this.selected = e.newIndex;
          }
        },
        onMove: e => {
          if (DOM(e.related).hasClass("ignore-sortable")) {
            return false;
          } else {
            return true;
          }
        }
      });
    },
    addField(this: any) {
      const newLocalValue = this.localValue.slice();
      const selected = this.value.length;
      const item: { [key: string]: any } = {
        __key: randomToken(4),
        _id: `field${selected + 1}`,
        label: `Field ${selected + 1}`,
        input: "text",
        required: true
      };
      newLocalValue.push(item);
      this.localValue = newLocalValue;
      this.selected = selected;
    },
    removeField(this: any, index: number) {
      const newLocalValue = this.localValue.slice();

      newLocalValue.splice(index, 1);

      this.localValue = newLocalValue;

      if (index == this.selected) {
        this.selected = index > 0 ? index - 1 : 0;
      }
    },
    getValue(this: any, _id: string) {
      return this.localValue[this.selected]
        ? this.localValue[this.selected][_id]
        : undefined;
    },
    setValue(this: any, _id: string, val: any) {
      const newLocalValue = this.localValue.slice();
      newLocalValue[this.selected] = Object.assign(
        {},
        newLocalValue[this.selected],
        {
          [_id]: val
        }
      );

      this.localValue = newLocalValue;
    },
    setIdentifier(val: any) {
      console.log(val);
      this.setValue("_id", camelCase(val));
    }
  }
};
</script>
<style lang="less">
.sortable-items {
  display: grid;
  grid-gap: 1em;

  grid-template-columns: 130px 1fr;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
  .controls {
    text-align: right;
    .sortable-item {
      box-shadow: 0 0 0 1px var(--color-border);

      font-size: 0.9em;
      margin-bottom: 0.75em;
      padding: 0.3em 0.75em;
      border-radius: 5px;
      text-align: center;
      cursor: move;
      cursor: -webkit-grab;
      cursor: -moz-grab;
      cursor: grab;
      &.active {
        background-color: var(--color-bg-contrast);

        font-weight: var(--font-weight-bold);
      }
      .handle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .factor-icon {
          opacity: 0.2;
        }
      }
    }
    .factor-btn {
      width: 100%;
      display: block;
    }
  }

  .inputs {
    box-shadow: 0 0 0 1px var(--color-border);
    padding: 1.5em;
    border-radius: 5px;
    background: #fff;
    .header {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      margin-bottom: 1em;
      width: 100%;
      max-width: 25em;
      .title {
        .title-input {
          background: transparent;
          box-shadow: none !important;
          border-radius: 0 !important;
          border-bottom: 1px dashed rgba(0, 0, 0, 0.2);
        }
        display: flex;
        align-items: center;
        margin-right: 0.5em;
        margin-bottom: 0.5em;
        .edit-me {
          margin-left: 1em;
          opacity: 0.4;
          font-size: 0.8em;
        }
        input {
          width: auto;
          padding: 0.2em;
          padding-left: 0;
          background: none;
          box-shadow: none;
          font-weight: var(--font-weight-bold);
        }
      }
    }
  }
}
</style>
