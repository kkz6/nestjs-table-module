<script setup lang="ts">
import { DataTable } from '..';
</script>

<template>
  <div class="container mx-auto py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">Users</h1>
      <p class="text-muted-foreground">Manage your application users.</p>
    </div>

    <DataTable
      endpoint="/api/users"
      table-class="UsersTable"
      :default-per-page="15"
      :debounce="300"
      :sync-url="true"
    />
  </div>
</template>
