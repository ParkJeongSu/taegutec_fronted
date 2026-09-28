<template>
  <v-card flat class="content-card">
    <v-card-title class="text-h5 font-weight-bold">
      <v-icon icon="$calendarCheck" class="mr-2" color="primary" />
      {{ $t('views.production.dailyPlan.title') }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-alert type="success" variant="tonal" border="start">
        {{ $t('views.production.dailyPlan.subtitle') }}
      </v-alert>
      <v-table class="mt-4">
        <thead>
          <tr>
            <th>{{ $t('table.lineName') }}</th>
            <th>{{ $t('table.targetQty') }}</th>
            <th>{{ $t('common.status') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Line-A</td>
            <td>1,200</td>
            <td><v-chip size="small" color="success">{{ $t('common.normal') }}</v-chip></td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
// Daily production plan view
</script>

<style scoped>
.content-card {
  border-radius: 12px;
}
</style>
