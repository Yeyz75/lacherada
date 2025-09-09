<template>
  <div class="primevue-demo">
    <h2 class="demo-title">
      <Icon icon="lucide:sparkles" class="demo-icon" />
      {{ $t('primevueDemo.title') }}
    </h2>

    <!-- Formulario de ejemplo -->
    <Card class="demo-card">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:user" class="header-icon" />
          <h3>{{ $t('primevueDemo.formTitle') }}</h3>
        </div>
      </template>

      <template #content>
        <div class="form-grid">
          <div class="form-field">
            <label for="name" class="field-label">
              <Icon icon="lucide:user" class="label-icon" />
              {{ $t('primevueDemo.name') }}
            </label>
            <InputText
              id="name"
              v-model="form.name"
              :placeholder="$t('primevueDemo.namePlaceholder')"
              class="w-full" />
          </div>

          <div class="form-field">
            <label for="email" class="field-label">
              <Icon icon="lucide:mail" class="label-icon" />
              {{ $t('primevueDemo.email') }}
            </label>
            <InputText
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="$t('primevueDemo.emailPlaceholder')"
              class="w-full" />
          </div>

          <div class="form-field">
            <label for="category" class="field-label">
              <Icon icon="lucide:tag" class="label-icon" />
              {{ $t('primevueDemo.category') }}
            </label>
            <Select
              id="category"
              v-model="form.category"
              :options="categories"
              option-label="name"
              option-value="code"
              :placeholder="$t('primevueDemo.categoryPlaceholder')"
              class="w-full">
              <template #option="slotProps">
                <div class="dropdown-option">
                  <Icon :icon="slotProps.option.icon" class="option-icon" />
                  {{ slotProps.option.name }}
                </div>
              </template>
            </Select>
          </div>

          <div class="form-field">
            <label for="message" class="field-label">
              <Icon icon="lucide:message-square" class="label-icon" />
              {{ $t('primevueDemo.message') }}
            </label>
            <Textarea
              id="message"
              v-model="form.message"
              :placeholder="$t('primevueDemo.messagePlaceholder')"
              rows="4"
              class="w-full" />
          </div>
        </div>
      </template>

      <template #footer>
        <div class="form-actions">
          <Button
            type="button"
            :label="$t('primevueDemo.cancel')"
            severity="secondary"
            @click="resetForm">
            <template #icon>
              <Icon icon="lucide:x" class="button-icon" />
            </template>
          </Button>

          <Button
            type="button"
            :label="$t('primevueDemo.submit')"
            @click="submitForm"
            :loading="isSubmitting">
            <template #icon>
              <Icon icon="lucide:check" class="button-icon" />
            </template>
          </Button>
        </div>
      </template>
    </Card>

    <!-- DataTable de ejemplo -->
    <Card class="demo-card">
      <template #header>
        <div class="card-header">
          <Icon icon="lucide:table" class="header-icon" />
          <h3>{{ $t('primevueDemo.dataTableTitle') }}</h3>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="tableData"
          paginator
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
          :loading="isLoadingTable"
          class="custom-table">
          <Column field="id" header="ID" sortable />
          <Column field="name" :header="$t('primevueDemo.name')" sortable />
          <Column
            field="category"
            :header="$t('primevueDemo.category')"
            sortable>
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.category"
                :severity="getTagSeverity(slotProps.data.category)" />
            </template>
          </Column>
          <Column field="status" :header="$t('primevueDemo.status')" sortable>
            <template #body="slotProps">
              <div class="status-cell">
                <Icon
                  icon="lucide:circle"
                  :class="[
                    'status-indicator',
                    `status-${slotProps.data.status.toLowerCase()}`,
                  ]" />
                {{ slotProps.data.status }}
              </div>
            </template>
          </Column>
          <Column :header="$t('primevueDemo.actions')">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button
                  severity="info"
                  size="small"
                  @click="editItem(slotProps.data)"
                  v-tooltip="$t('primevueDemo.edit')">
                  <template #icon>
                    <Icon icon="lucide:edit" class="action-icon" />
                  </template>
                </Button>

                <Button
                  severity="danger"
                  size="small"
                  @click="deleteItem(slotProps.data)"
                  v-tooltip="$t('primevueDemo.delete')">
                  <template #icon>
                    <Icon icon="lucide:trash" class="action-icon" />
                  </template>
                </Button>
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Toast para notificaciones -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { Icon } from '@iconify/vue'

// Importaciones de PrimeVue
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Select from 'primevue/select'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'

// Definir tipos para la demo
interface DemoTableItem {
  id: number
  name: string
  category: string
  status: string
}

interface CategoryOption {
  name: string
  code: string
  icon: string
}

const { t } = useI18n()
const toast = useToast()

// Estado del formulario
const form = ref({
  name: '',
  email: '',
  category: null,
  message: '',
})

const isSubmitting = ref(false)

// Opciones del dropdown
const categories = ref<CategoryOption[]>([
  { name: 'Tecnología', code: 'tech', icon: 'lucide:laptop' },
  { name: 'Diseño', code: 'design', icon: 'lucide:palette' },
  { name: 'Marketing', code: 'marketing', icon: 'lucide:megaphone' },
  { name: 'Ventas', code: 'sales', icon: 'lucide:trending-up' },
])

// Datos de la tabla
const tableData = ref<DemoTableItem[]>([])
const isLoadingTable = ref(true)

// Funciones
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    category: null,
    message: '',
  }
  toast.add({
    severity: 'info',
    summary: t('primevueDemo.info'),
    detail: t('primevueDemo.formReset'),
    life: 3000,
  })
}

const submitForm = async () => {
  isSubmitting.value = true

  // Simular envío
  await new Promise((resolve) => setTimeout(resolve, 2000))

  toast.add({
    severity: 'success',
    summary: t('primevueDemo.success'),
    detail: t('primevueDemo.formSubmitted'),
    life: 3000,
  })

  isSubmitting.value = false
  resetForm()
}

const getTagSeverity = (
  category: string,
): 'success' | 'info' | 'warn' | 'danger' | undefined => {
  switch (category) {
    case 'Tecnología':
      return 'info'
    case 'Diseño':
      return 'success'
    case 'Marketing':
      return 'warn'
    case 'Ventas':
      return 'danger'
    default:
      return undefined
  }
}

const editItem = (item: any) => {
  toast.add({
    severity: 'info',
    summary: t('primevueDemo.edit'),
    detail: `${t('primevueDemo.editing')} ${item.name}`,
    life: 3000,
  })
}

const deleteItem = (item: any) => {
  toast.add({
    severity: 'warn',
    summary: t('primevueDemo.delete'),
    detail: `${t('primevueDemo.deleting')} ${item.name}`,
    life: 3000,
  })
}

// Cargar datos de ejemplo
onMounted(async () => {
  // Simular carga de datos
  await new Promise((resolve) => setTimeout(resolve, 1500))

  tableData.value = [
    { id: 1, name: 'Juan Pérez', category: 'Tecnología', status: 'Active' },
    { id: 2, name: 'María García', category: 'Diseño', status: 'Inactive' },
    { id: 3, name: 'Carlos López', category: 'Marketing', status: 'Active' },
    { id: 4, name: 'Ana Martínez', category: 'Ventas', status: 'Pending' },
    {
      id: 5,
      name: 'Luis Rodríguez',
      category: 'Tecnología',
      status: 'Active',
    },
    { id: 6, name: 'Elena Sánchez', category: 'Diseño', status: 'Active' },
  ]

  isLoadingTable.value = false
})
</script>

<style scoped>
.primevue-demo {
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.demo-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.demo-card {
  margin-bottom: var(--space-xl);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
}

.header-icon {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.form-grid {
  display: grid;
  gap: var(--space-lg);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.field-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.label-icon {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.button-icon {
  font-size: 1rem;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.option-icon {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.custom-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.status-indicator {
  font-size: 0.75rem;
}

.status-active {
  color: var(--color-success);
}

.status-inactive {
  color: var(--color-error);
}

.status-pending {
  color: var(--color-warning);
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.action-icon {
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .primevue-demo {
    padding: var(--space-md);
  }

  .demo-title {
    font-size: var(--font-size-2xl);
  }

  .form-actions {
    justify-content: stretch;
    flex-direction: column;
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>
