<template>
  <div class="w-full" :class="containerClasses">
    <!-- Table Header (if title or actions provided) -->
    <div
      v-if="$slots.header || title"
      class="mb-4 flex items-center justify-between">
      <div class="flex-1">
        <h3 v-if="title" class="text-lg font-semibold text-text-primary">
          {{ title }}
        </h3>
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-3">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table Wrapper for responsiveness -->
    <div
      class="overflow-x-auto rounded-2xl border border-border bg-surface-primary shadow-sm">
      <table class="w-full min-w-full" :id="id" :data-testid="testId">
        <!-- Table Header -->
        <thead class="bg-surface-secondary/60 text-text-muted">
          <tr class="border-b border-border">
            <!-- Selection column -->
            <th v-if="selectable" class="px-5 py-4 text-left">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-border bg-surface-primary text-primary-500 focus:ring-2 focus:ring-primary/30"
                :checked="isAllSelected"
                :indeterminate="isSomeSelected"
                @change="handleSelectAll" />
            </th>

            <!-- Data columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider"
              :class="[
                {
                  'text-left': column.align === 'left' || !column.align,
                  'text-center': column.align === 'center',
                  'text-right': column.align === 'right',
                  'cursor-pointer transition hover:bg-surface-tertiary':
                    column.sortable,
                },
              ]"
              :style="{ width: column.width }"
              @click="column.sortable ? handleSort(column.key) : null">
              <div class="flex items-center gap-1 text-text-muted">
                <span>{{ column.label }}</span>
                <Icon
                  v-if="column.sortable"
                  :icon="getSortIcon(column.key)"
                  class="h-4 w-4 text-text-muted"
                  :class="{
                    'text-primary-500': sortBy === column.key,
                  }" />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody
          class="divide-y divide-border bg-surface-primary text-text-primary">
          <!-- Loading state -->
          <tr v-if="loading">
            <td :colspan="totalColumns" class="px-5 py-10 text-center">
              <div
                class="flex items-center justify-center gap-2 text-text-muted">
                <Icon icon="mdi:loading" class="h-5 w-5 animate-spin" />
                <span>Cargando...</span>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="data.length === 0">
            <td :colspan="totalColumns" class="px-5 py-10 text-center">
              <div
                class="flex items-center justify-center gap-2 text-text-muted">
                <Icon icon="mdi:database-off" class="h-5 w-5" />
                <span>{{ emptyMessage || 'No hay datos disponibles' }}</span>
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            class="cursor-pointer transition-colors duration-150 hover:bg-surface-tertiary"
            :class="{
              'bg-primary-50/60': selectedRows.has(getRowKey(row, index)),
            }"
            @click="handleRowClick(row, index)">
            <!-- Selection column -->
            <td v-if="selectable" class="px-5 py-4">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-border bg-surface-primary text-primary-500 focus:ring-2 focus:ring-primary/30"
                :checked="selectedRows.has(getRowKey(row, index))"
                @change="handleRowSelect(row, index, $event)"
                @click.stop />
            </td>

            <!-- Data columns -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-5 py-4 text-sm"
              :class="{
                'text-left': column.align === 'left' || !column.align,
                'text-center': column.align === 'center',
                'text-right': column.align === 'right',
              }">
              <!-- Custom render function -->
              <template v-if="column.render">
                <component
                  v-if="
                    typeof column.render(
                      getValue(row, column.key),
                      row,
                      index,
                    ) === 'object'
                  "
                  :is="column.render(getValue(row, column.key), row, index)" />
                <span v-else class="text-text-primary">
                  {{ column.render(getValue(row, column.key), row, index) }}
                </span>
              </template>

              <!-- Default value display -->
              <span v-else class="text-text-primary">
                {{ getValue(row, column.key) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer with pagination -->
    <div
      v-if="pagination && !loading"
      class="flex items-center justify-between border-t border-border bg-surface-primary px-5 py-4 text-sm text-text-muted sm:px-6">
      <div>
        <span>
          Mostrando {{ (pagination.page - 1) * pagination.size + 1 }} -
          {{ Math.min(pagination.page * pagination.size, pagination.total) }}
          de {{ pagination.total }} resultados
        </span>
      </div>

      <div class="flex items-center gap-2 text-text-muted">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="mdi:chevron-left"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)">
          Anterior
        </BaseButton>

        <span class="text-sm text-text-muted">
          Página {{ pagination.page }} de
          {{ Math.ceil(pagination.total / pagination.size) }}
        </span>

        <BaseButton
          variant="ghost"
          size="sm"
          icon="mdi:chevron-right"
          icon-position="right"
          :disabled="
            pagination.page >= Math.ceil(pagination.total / pagination.size)
          "
          @click="handlePageChange(pagination.page + 1)">
          Siguiente
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import BaseButton from './BaseButton.vue'
import type { TableProps } from '../../types'

interface Props extends TableProps {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
  emptyMessage: 'No hay datos disponibles',
  sortOrder: 'asc',
})

const emit = defineEmits<{
  'sort': [column: string, order: 'asc' | 'desc']
  'row-click': [row: any, index: number]
  'row-select': [selectedRows: any[]]
  'page-change': [page: number]
}>()

const selectedRows = ref(new Set<string>())

// Computed properties
const totalColumns = computed(() => {
  return props.columns.length + (props.selectable ? 1 : 0)
})

const containerClasses = computed(() => [
  {
    'opacity-50 pointer-events-none': props.loading,
  },
  props.class,
])

const isAllSelected = computed(() => {
  return props.data.length > 0 && selectedRows.value.size === props.data.length
})

const isSomeSelected = computed(() => {
  return (
    selectedRows.value.size > 0 && selectedRows.value.size < props.data.length
  )
})

// Helper functions
const getRowKey = (row: any, index: number): string => {
  return row.id || row.key || index.toString()
}

const getValue = (row: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const getSortIcon = (columnKey: string): string => {
  if (props.sortBy !== columnKey) return 'mdi:unfold-more-horizontal'
  return props.sortOrder === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'
}

// Event handlers
const handleSort = (columnKey: string) => {
  const newOrder =
    props.sortBy === columnKey && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('sort', columnKey, newOrder)
}

const handleRowClick = (row: any, index: number) => {
  emit('row-click', row, index)
}

const handleRowSelect = (row: any, index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const rowKey = getRowKey(row, index)

  if (target.checked) {
    selectedRows.value.add(rowKey)
  } else {
    selectedRows.value.delete(rowKey)
  }

  emitSelectedRows()
}

const handleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target.checked) {
    props.data.forEach((row, index) => {
      selectedRows.value.add(getRowKey(row, index))
    })
  } else {
    selectedRows.value.clear()
  }

  emitSelectedRows()
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const emitSelectedRows = () => {
  const selected = props.data.filter((row, index) =>
    selectedRows.value.has(getRowKey(row, index)),
  )
  emit('row-select', selected)
}

// Public methods
const clearSelection = () => {
  selectedRows.value.clear()
  emitSelectedRows()
}

const selectAll = () => {
  props.data.forEach((row, index) => {
    selectedRows.value.add(getRowKey(row, index))
  })
  emitSelectedRows()
}

defineExpose({
  clearSelection,
  selectAll,
  selectedRows: computed(() => Array.from(selectedRows.value)),
})
</script>

<script lang="ts">
export default {
  name: 'BaseTable',
  inheritAttrs: false,
}
</script>
