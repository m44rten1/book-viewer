<template>
  <v-app>
    <v-main>
      <v-container fluid class="app-container">
        <!-- Filter bar -->
        <div class="filter-bar mb-3">
          <div class="filter-actions">
            <v-btn variant="tonal" color="primary" size="small" rounded="pill" prepend-icon="mdi-filter-variant"
              :append-icon="filtersOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="filtersOpen = !filtersOpen">
              Filters
              <v-badge v-if="activeFilterCount > 0" :content="activeFilterCount" color="primary" inline class="ml-1" />
            </v-btn>
            <v-btn v-if="hasSelectedBooks" variant="text" color="primary" size="small" rounded="pill"
              prepend-icon="mdi-close-circle-outline" @click="clearSelectedBooks">
              Unselect all
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-show="filtersOpen" class="filter-panel mt-3">
              <div class="filter-section">
                <div class="text-caption text-medium-emphasis mb-1">Status</div>
                <div class="d-flex ga-2 flex-wrap">
                  <v-chip :variant="showRenewable ? 'flat' : 'outlined'" :color="showRenewable ? 'success' : undefined"
                    size="small" label @click="showRenewable = !showRenewable">
                    Renewable
                  </v-chip>
                  <v-chip :variant="showNonRenewable ? 'flat' : 'outlined'"
                    :color="showNonRenewable ? 'error' : undefined" size="small" label
                    @click="showNonRenewable = !showNonRenewable">
                    Not renewable
                  </v-chip>
                </div>
              </div>
              <div class="filter-section mt-3">
                <div class="text-caption text-medium-emphasis mb-1">Due dates</div>
                <v-select v-model="selectedDueDates" :items="allDueDates" label="Select dates" multiple chips
                  closable-chips density="compact" hide-details variant="outlined" class="due-date-select" />
              </div>
              <div class="filter-section mt-3">
                <v-switch v-model="showAllColumns" label="Show all details" density="compact" hide-details
                  color="primary" />
              </div>
            </div>
          </v-expand-transition>
        </div>

        <!-- Desktop: table -->
        <v-data-table :headers="visibleHeaders" :items="tableItems" :sort-by="[{ key: 'daysLeft', order: 'asc' }]"
          :items-per-page="-1" hide-default-footer class="books-table d-none d-md-block rounded-lg"
          :row-props="tableRowProps" @click:row="onRowClick">
          <template #item.index="{ item }">
            {{ item.index }}
          </template>
          <template #item.cover="{ item }">
            <img v-if="item.id" :src="`/assets/${item.id}.png`" width="150" height="200" alt="" loading="lazy" />
            <span v-else class="text-medium-emphasis">No Image</span>
          </template>
          <template #item.renewable="{ item }">
            <v-chip :color="item.isRenewable ? 'success' : 'error'" size="x-small" label variant="tonal">
              {{ item.isRenewable ? "Yes" : "No" }}
            </v-chip>
          </template>
          <template #item.reserved="{ item }">
            <v-chip v-if="item.hasReservation" color="error" size="x-small" label variant="tonal">
              Reserved
            </v-chip>
          </template>
          <template #item.daysLeft="{ item }">
            <span>{{ item.daysLeft }}</span>
          </template>
        </v-data-table>

        <!-- Mobile: cover-first grid -->
        <div class="book-grid d-md-none">
          <v-card v-for="(item, i) in tableItems" :key="item.id || i" class="book-card"
            :class="[urgencyCardClass(item.daysLeft), { 'book-card--selected': isBookSelected(getBookSelectionId(item, i)), 'book-card--reserved': item.hasReservation }]"
            rounded="lg" elevation="1" @click="toggleBookSelection(getBookSelectionId(item, i))">
            <div class="cover-wrapper">
              <img v-if="item.id" :src="`/assets/${item.id}.png`" alt="" loading="lazy" class="cover-img" />
              <div v-else class="cover-placeholder text-medium-emphasis text-caption">
                No image
              </div>
              <v-chip class="renewable-badge" :color="item.isRenewable ? 'success' : 'error'" size="x-small" label
                variant="flat">
                {{ item.isRenewable ? "Renewable" : "Not renewable" }}
              </v-chip>
              <v-chip v-if="item.hasReservation" class="reservation-badge" color="error" size="x-small" label
                variant="flat">
                Reserved
              </v-chip>
            </div>
            <div class="book-card-body pa-2">
              <div class="book-card-top">
                <div class="text-body-2 font-weight-medium book-title">
                  {{ item.name }}
                </div>
                <div v-if="item.by" class="text-caption text-medium-emphasis mt-half">
                  {{ item.by }}
                </div>
                <template v-if="showAllColumns">
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ item.type }} · Renewed: {{ item.renewed }}
                  </div>
                </template>
              </div>
              <div class="d-flex align-center justify-space-between mt-2 book-card-footer">
                <span class="text-caption text-medium-emphasis">{{ item.accountName }}</span>
                <span class="text-caption text-medium-emphasis">{{ item.daysLeft }}d</span>
              </div>
            </div>
          </v-card>
        </div>
      </v-container>

      <!-- Footer with build timestamp -->
      <div v-if="buildTimestamp" class="build-footer text-center text-caption text-medium-emphasis py-2">
        Last deployed: {{ buildTimestamp }}
      </div>
    </v-main>
  </v-app>
</template>

<script>
const SELECTED_BOOKS_STORAGE_KEY = "selected-book-ids";

export default {
  data() {
    return {
      buildTimestamp: typeof window !== "undefined" ? window.__BUILD_TIMESTAMP__ || "" : "",
      booksData: [],
      showRenewable: false,
      showNonRenewable: true,
      selectedDueDates: [],
      showAllColumns: false,
      selectedBookIds: [],
      filtersOpen: false,
      columnsHiddenByDefault: ["index", "name", "renewed", "by", "dueDate"],
      headers: [
        { title: "#", key: "index", width: 60, sortable: false },
        { title: "Cover Image", key: "cover", width: 150, sortable: false },
        { title: "Days Left", key: "daysLeft", width: 100, sortable: true },
        { title: "Due Date", key: "dueDate", width: 120, sortable: true },
        { title: "Renewable", key: "renewable", width: 100, sortable: true },
        { title: "Reserved", key: "reserved", width: 100, sortable: true },
        { title: "Account Name", key: "accountName", width: 200, sortable: true },
        { title: "Book Name", key: "name", width: 150, sortable: true },
        { title: "Renewed", key: "renewed", width: 100, sortable: true },
        { title: "Author", key: "by", width: 200, sortable: true },
        { title: "Type", key: "type", width: 200, sortable: true },
      ],
    };
  },
  computed: {
    hasSelectedBooks() {
      return this.selectedBookIds.length > 0;
    },
    allDueDates() {
      const set = new Set();
      this.booksData.forEach((book) => {
        if (book.dueDate) set.add(book.dueDate);
      });
      return [...set].sort();
    },
    activeFilterCount() {
      let count = 0;
      if (this.showRenewable) count++;
      if (this.showNonRenewable) count++;
      if (this.selectedDueDates.length > 0) count++;
      return count;
    },
    filteredBooks() {
      return this.booksData.filter((book) => {
        const renewableMatch =
          (book.isRenewable && this.showRenewable) ||
          (!book.isRenewable && this.showNonRenewable);
        if (!renewableMatch) return false;
        if (this.selectedDueDates.length > 0) {
          return this.selectedDueDates.includes(book.dueDate);
        }
        return true;
      });
    },
    visibleHeaders() {
      if (this.showAllColumns) return this.headers;
      return this.headers.filter(
        (h) => !this.columnsHiddenByDefault.includes(h.key)
      );
    },
    tableItems() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return this.filteredBooks
        .map((book) => {
          const due = new Date(book.dueDate + "T00:00:00");
          const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          return { ...book, daysLeft, renewable: book.isRenewable, reserved: book.hasReservation };
        })
        .sort((a, b) => a.daysLeft - b.daysLeft)
        .map((book, i) => ({ ...book, index: i + 1 }));
    },
  },
  watch: {
    filteredBooks(books) {
      if (books.length === 0) {
        this.filtersOpen = true;
      }
    },
  },
  mounted() {
    this.selectedBookIds = this.readSelectedBooks();

    fetch("/assets/books.json", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        this.booksData = data;
        this.pruneSelectedBooks();
        this.selectDefaultDueDates();
      });
  },
  methods: {
    getBookSelectionId(book, fallbackIndex) {
      if (book.id) return book.id;

      const parts = [
        book.accountName,
        book.name,
        book.dueDate,
        book.type,
        book.by,
        book.renewed,
      ].filter(Boolean);

      return `book:${parts.join("::") || `fallback-${fallbackIndex}`}`;
    },
    isBookSelected(id) {
      return this.selectedBookIds.includes(id);
    },
    readSelectedBooks() {
      if (typeof window === "undefined") return [];

      try {
        const stored = window.localStorage.getItem(SELECTED_BOOKS_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    persistSelectedBooks() {
      if (typeof window === "undefined") return;

      if (this.selectedBookIds.length === 0) {
        window.localStorage.removeItem(SELECTED_BOOKS_STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(
        SELECTED_BOOKS_STORAGE_KEY,
        JSON.stringify(this.selectedBookIds)
      );
    },
    toggleBookSelection(id) {
      const idx = this.selectedBookIds.indexOf(id);
      if (idx === -1) {
        this.selectedBookIds.push(id);
      } else {
        this.selectedBookIds.splice(idx, 1);
      }
      this.persistSelectedBooks();
    },
    clearSelectedBooks() {
      this.selectedBookIds = [];
      this.persistSelectedBooks();
    },
    pruneSelectedBooks() {
      const validIds = new Set(
        this.booksData.map((book, index) => this.getBookSelectionId(book, index))
      );
      this.selectedBookIds = this.selectedBookIds.filter((id) => validIds.has(id));
      this.persistSelectedBooks();
    },
    tableRowProps({ item }) {
      const id = this.getBookSelectionId(item, item.index - 1);
      const urgency = item.daysLeft <= 0 ? 'table-row--overdue' : item.daysLeft < 4 ? 'table-row--warning' : '';
      const selected = this.isBookSelected(id) ? 'table-row--selected' : '';
      const reserved = item.hasReservation ? 'table-row--reserved' : '';
      const cls = [urgency, selected, reserved].filter(Boolean).join(' ');
      return cls ? { class: cls } : {};
    },
    onRowClick(event, { item }) {
      const id = this.getBookSelectionId(item, item.index - 1);
      this.toggleBookSelection(id);
    },
    urgencyCardClass(daysLeft) {
      if (daysLeft <= 0) return 'book-card--overdue';
      if (daysLeft < 4) return 'book-card--warning';
      return '';
    },
    selectDefaultDueDates() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(end.getDate() + 15);
      this.selectedDueDates = this.allDueDates.filter((dateStr) => {
        const d = new Date(dateStr + "T00:00:00");
        return d <= end;
      });
    },
  },
};
</script>

<style scoped>
.app-container {
  padding: 1rem;
  max-width: 960px;
}

/* Filter bar */
.filter-bar {
  position: relative;
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.filter-panel {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.due-date-select {
  max-width: 100%;
}

/* Desktop table */
.books-table {
  width: 100%;
}

.books-table :deep(th) {
  white-space: nowrap;
}

.books-table :deep(tr) {
  cursor: pointer;
}

.books-table :deep(tr.table-row--overdue td) {
  background: rgba(239, 68, 68, 0.07);
}

.books-table :deep(tr.table-row--warning td) {
  background: rgba(202, 138, 4, 0.07);
}

.books-table :deep(tr.table-row--selected td) {
  background: rgba(var(--v-theme-primary), 0.10);
}

.books-table :deep(tr.table-row--reserved td) {
  border-top: 3px solid #D32F2F;
  border-bottom: 3px solid #D32F2F;
}

.books-table :deep(tr.table-row--reserved td:first-child) {
  border-left: 3px solid #D32F2F;
}

.books-table :deep(tr.table-row--reserved td:last-child) {
  border-right: 3px solid #D32F2F;
}

/* Mobile book grid */
.book-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.book-card {
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.book-card:active {
  transform: scale(0.97);
}

.book-card--overdue {
  background: rgba(239, 68, 68, 0.08) !important;
}

.book-card--warning {
  background: rgba(202, 138, 4, 0.08) !important;
}

.book-card--selected {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: -2px;
  background: rgba(var(--v-theme-primary), 0.09) !important;
}

.book-card--reserved {
  border: 3px solid #D32F2F !important;
}

/* Cover area */
.cover-wrapper {
  position: relative;
  padding: 0.5rem 0.5rem 0;
}

.cover-img {
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
  border-radius: 8px;
}

.cover-placeholder {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.renewable-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 10px !important;
}

.reservation-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  font-size: 10px !important;
}

/* Card text area */
.book-card-body {
  overflow-wrap: break-word;
  word-break: break-word;
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.book-card-top {
  flex: 1;
}

.book-card-footer {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 0.375rem;
}

.book-title {
  line-height: 1.3;
  font-size: 0.8125rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mt-half {
  margin-top: 2px;
}

/* Footer */
.build-footer {
  padding-bottom: env(safe-area-inset-bottom, 0.5rem);
}
</style>
