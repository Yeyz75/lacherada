<template>
  <div class="base-table-container" :class="containerClasses">
    <!-- Table Header (if title or actions provided) -->
    <div v-if="$slots.header || title" class="base-table-header">
      <div class="base-table-title">
        <h3 v-if="title">{{ title }}</h3>
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="base-table-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- Table Wrapper for responsiveness -->
    <div class="base-table-wrapper">
      <table class="base-table" :id="id" :data-testid="testId">
        <!-- Table Header -->
        <thead class="base-table-thead">
          <tr class="base-table-tr base-table-tr--header">
            <!-- Selection column -->
            <th
              v-if="selectable"
              class="base-table-th base-table-th--selection">
              <input
                type="checkbox"
                class="base-table-checkbox"
                :checked="isAllSelected"
                :indeterminate="isSomeSelected"
                @change="handleSelectAll" />
            </th>

            <!-- Data columns -->
            <th
              v-for="column in columns"
              :key="column.key"
              class="base-table-th"
              :class="[
                `base-table-th--${column.align || 'left'}`,
                { 'base-table-th--sortable': column.sortable },
              ]"
              :style="{ width: column.width }"
              @click="column.sortable ? handleSort(column.key) : null">
              <div class="base-table-th-content">
                <span>{{ column.label }}</span>
                <Icon
                  v-if="column.sortable"
                  :icon="getSortIcon(column.key)"
                  class="base-table-sort-icon"
                  :class="{
                    'base-table-sort-icon--active': sortBy === column.key,
                  }" />
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="base-table-tbody">
          <!-- Loading state -->
          <tr v-if="loading" class="base-table-tr base-table-tr--loading">
            <td
              :colspan="totalColumns"
              class="base-table-td base-table-td--loading">
              <div class="base-table-loading">
                <Icon icon="mdi:loading" class="animate-spin" />
                <span>Cargando...</span>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr
            v-else-if="data.length === 0"
            class="base-table-tr base-table-tr--empty">
            <td
              :colspan="totalColumns"
              class="base-table-td base-table-td--empty">
              <div class="base-table-empty">
                <Icon icon="mdi:database-off" />
                <span>{{ emptyMessage || 'No hay datos disponibles' }}</span>
              </div>
            </td>
          </tr>

          <!-- Data rows -->
          <tr
            v-else
            v-for="(row, index) in data"
            :key="getRowKey(row, index)"
            class="base-table-tr base-table-tr--data"
            :class="{
              'base-table-tr--selected': selectedRows.has(
                getRowKey(row, index),
              ),
            }"
            @click="handleRowClick(row, index)">
            <!-- Selection column -->
            <td
              v-if="selectable"
              class="base-table-td base-table-td--selection">
              <input
                type="checkbox"
                class="base-table-checkbox"
                :checked="selectedRows.has(getRowKey(row, index))"
                @change="handleRowSelect(row, index, $event)"
                @click.stop />
            </td>

            <!-- Data columns -->
            <td
              v-for="column in columns"
              :key="column.key"
              class="base-table-td"
              :class="`base-table-td--${column.align || 'left'}`">
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
    <div v-if="pagination && !loading" class="base-table-footer">
      <div class="base-table-info">
        <span>
          Mostrando {{ (pagination.page - 1) * pagination.size + 1 }} -
          {{ Math.min(pagination.page * pagination.size, pagination.total) }}
          de {{ pagination.total }} resultados
        </span>
      </div>

      <div class="base-table-pagination">
        <BaseButton
          variant="ghost"
          size="sm"
          icon="mdi:chevron-left"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)">
          Anterior
        </BaseButton>

        <span class="base-table-page-info">
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
    'base-table-container',
    {
      'base-table-container--loading': props.loading,
      'base-table-container--selectable': props.selectable,
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

<style scoped>
  .base-table-container {
    display: flex;
    flex-direction: column;
    background: var(--color-background);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  /* =============================================================================
     TABLE HEADER
     ============================================================================= */

  .base-table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background-secondary);
  }

  .base-table-title h3 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .base-table-actions {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  /* =============================================================================
     TABLE WRAPPER
     ============================================================================= */

  .base-table-wrapper {
    overflow-x: auto;
    border-radius: inherit;
  }

  .base-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-sm);
  }

  /* =============================================================================
     TABLE HEAD
     ============================================================================= */

  .base-table-thead {
    background: var(--table-header-bg);
    border-bottom: 2px solid var(--color-border);
  }

  .base-table-tr--header {
    height: var(--table-header-height);
  }

  .base-table-th {
    padding: var(--table-cell-padding);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    border-right: 1px solid var(--color-border);

    &:last-child {
      border-right: none;
    }
  }

  .base-table-th--left {
    text-align: left;
  }

  .base-table-th--center {
    text-align: center;
  }

  .base-table-th--right {
    text-align: right;
  }

  .base-table-th--sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color var(--transition-fast);

    &:hover {
      background: var(--table-row-hover-bg);
    }
  }

  .base-table-th--selection {
    width: 48px;
    text-align: center;
  }

  .base-table-th-content {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .base-table-sort-icon {
    opacity: 0.5;
    transition: opacity var(--transition-fast);
  }

  .base-table-sort-icon--active {
    opacity: 1;
    color: var(--color-primary);
  }

  /* =============================================================================
     TABLE BODY
     ============================================================================= */

  .base-table-tbody {
    background: var(--color-background);
  }

  .base-table-tr--data {
    height: var(--table-row-height);
    border-bottom: 1px solid var(--table-border-color);
    transition: background-color var(--transition-fast);
    cursor: pointer;

    &:hover {
      background: var(--table-row-hover-bg);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .base-table-tr--selected {
    background: var(--table-selected-bg) !important;
  }

  .base-table-td {
    padding: var(--table-cell-padding);
    border-right: 1px solid var(--table-border-color);
    color: var(--color-text-primary);

    &:last-child {
      border-right: none;
    }
  }

  .base-table-td--left {
    text-align: left;
  }

  .base-table-td--center {
    text-align: center;
  }

  .base-table-td--right {
    text-align: right;
  }

  .base-table-td--selection {
    width: 48px;
    text-align: center;
  }

  /* =============================================================================
     SPECIAL STATES
     ============================================================================= */

  .base-table-td--loading,
  .base-table-td--empty {
    text-align: center;
    padding: var(--space-3xl) var(--space-lg);
  }

  .base-table-loading,
  .base-table-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    color: var(--color-text-secondary);
  }

  .base-table-loading .animate-spin {
    animation: spin 1s linear infinite;
    font-size: var(--font-size-2xl);
    color: var(--color-primary);
  }

  .base-table-empty {
    font-size: var(--font-size-2xl);
    opacity: 0.6;
  }

  /* =============================================================================
     TABLE FOOTER
     ============================================================================= */

  .base-table-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-md) var(--space-lg);
    border-top: 1px solid var(--color-border);
    background: var(--color-background-secondary);
  }

  .base-table-info {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .base-table-pagination {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .base-table-page-info {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  /* =============================================================================
     CHECKBOX STYLING
     ============================================================================= */

  .base-table-checkbox {
    width: 16px;
    height: 16px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:checked {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    &:indeterminate {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
  }

  /* =============================================================================
     RESPONSIVE DESIGN
     ============================================================================= */

  @media (max-width: 768px) {
    .base-table-header {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-md);
    }

    .base-table-footer {
      flex-direction: column;
      gap: var(--space-md);
      align-items: stretch;
    }

    .base-table-pagination {
      justify-content: center;
    }

    .base-table {
      font-size: var(--font-size-xs);
    }

    .base-table-th,
    .base-table-td {
      padding: var(--space-xs) var(--space-sm);
    }
  }

  /* =============================================================================
     ANIMATIONS
     ============================================================================= */

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
