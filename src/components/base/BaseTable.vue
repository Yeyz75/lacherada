<template>
  <div class="w-full" :class="containerClasses">
    <!-- Table Header (if title or actions provided) -->
    <div
      v-if="$slots.header || title"
      class="flex items-center justify-between mb-4">
      <div class="flex-1">
        <h3 v-if="title" class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h3>
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table Wrapper for responsiveness -->
    <div class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full" :id="id" :data-testid="testId">
        <!-- Table Header -->
        <thead class="bg-gray-50">
          <tr class="border-b border-gray-200">
            <!-- Selection column -->
            <th v-if="selectable" class="px-4 py-3 text-left">
              <input
                type="checkbox"
                class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                :checked="isAllSelected"
                :indeterminate="isSomeSelected"
                @change="handleSelectAll" />
            </th>

            <!-- Data columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="[
                {
                  'text-left': column.align === 'left' || !column.align,
                  'text-center': column.align === 'center',
                  'text-right': column.align === 'right',
                  'cursor-pointer hover:bg-gray-100': column.sortable,
                },
              ]"
              :style="{ width: column.width }"
              @click="column.sortable ? handleSort(column.key) : null">
              <div class="flex items-center gap-1">
                <span>{{ column.label }}</span>
                <Icon
                  v-if="column.sortable"
                  :icon="getSortIcon(column.key)"
                  class="w-4 h-4 text-gray-400"
                  :class="{
                    'text-orange-600': sortBy === column.key,
                  }" />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Loading state -->
          <tr v-if="loading">
            <td :colspan="totalColumns" class="px-4 py-8 text-center">
              <div class="flex items-center justify-center gap-2 text-gray-500">
                <Icon icon="mdi:loading" class="w-5 h-5 animate-spin" />
                <span>Cargando...</span>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="data.length === 0">
            <td :colspan="totalColumns" class="px-4 py-8 text-center">
              <div class="flex items-center justify-center gap-2 text-gray-500">
                <Icon icon="mdi:database-off" class="w-5 h-5" />
                <span>{{ emptyMessage || 'No hay datos disponibles' }}</span>
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            class="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            :class="{
              'bg-orange-50': selectedRows.has(getRowKey(row, index)),
            }"
            @click="handleRowClick(row, index)">
            <!-- Selection column -->
            <td v-if="selectable" class="px-4 py-3">
              <input
                type="checkbox"
                class="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                :checked="selectedRows.has(getRowKey(row, index))"
                @change="handleRowSelect(row, index, $event)"
                @click.stop />
            </td>

            <!-- Data columns -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-sm text-gray-900"
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
                <span v-else>{{
                  column.render(getValue(row, column.key), row, index)
                }}</span>
              </template>

              <!-- Default value display -->
              <span v-else>{{ getValue(row, column.key) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer with pagination -->
    <div
      v-if="pagination && !loading"
      class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div class="text-sm text-gray-700">
        <span>
          Mostrando {{ (pagination.page - 1) * pagination.size + 1 }} -
          {{ Math.min(pagination.page * pagination.size, pagination.total) }}
          de {{ pagination.total }} resultados
        </span>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="mdi:chevron-left"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)">
          Anterior
        </BaseButton>

        <span class="text-sm text-gray-700">
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
    return (
      props.data.length > 0 && selectedRows.value.size === props.data.length
    )
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
