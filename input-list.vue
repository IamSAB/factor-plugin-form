<template>
  <div class="sortable-items">
    <div ref="organizer" class="controls">
      <div
        v-for="(item, i) in localValue"
        :key="item.__key"
        class="sortable-item"
        :class="i == selected ? 'active' : 'inactive'"
        @click="selected = i"
      >
        <factor-input-wrap
          :value="value[i]"
          :data-test="`input-value-${selected + 1}`"
          input="text"
          placeholder="Value"
          @input="setValue('value', $event)"
          required
        />
        <factor-input-wrap
          :value="getValue('_default')"
          :data-test="`input-label-${selected + 1}`"
          input="text"
          label="Label"
          @input="setValue('label', $event)"
          required
        />
        <factor-input-wrap
          v-if="placeholder"
          :value="getValue('placeholder')"
          :data-test="`input-placeholder-${selected + 1}`"
          input="textarea"
          label="Placeholder"
          @input="setValue('placeholder', $event)"
        />
        <factor-input-wrap
          v-if="description"
          :value="getValue('description')"
          :data-test="`input-description-${selected + 1}`"
          input="textarea"
          label="Description"
          @input="setValue('description', $event)"
        />
        <div class="handle">
          <span>{{ item.label || `Field ${selected}` }}</span>
          <factor-icon icon="fas fa-grip-horizontal" />
        </div>
        <div>
          <factor-btn size="small" @click="removeItem(selected)">
            <factor-icon icon="fas fa-trash" />
          </factor-btn>
        </div>
      </div>
      <factor-btn class="add-item" @click="addItem()">{{ `Add Field` }}</factor-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { factorBtn, factorIcon, factorInputWrap } from "@factor/ui";
import { randomToken } from "@factor/api/utils";
import DOM from "jquery";
import Sortable from "sortablejs";

export default {
  components: { factorBtn, factorIcon, factorInputWrap },
  props: {
    value: {
      type: Array,
      default: []
    },
    placeholder: {
      type: Boolean,
      default: false
    },
    description: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selected: 0
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
    addItem(this: any) {
      const newLocalValue = this.localValue.slice();
      const selected = this.value.length;
      const item: { [key: string]: any } = {
        __key: randomToken(4),
        label: `Option ${selected}`,
        placeholder: "",
        description: ""
      };
      newLocalValue.push(item);
      this.localValue = newLocalValue;
      this.selected = selected;
    },
    removeItem(this: any, index: number) {
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
    }
  }
};
</script>