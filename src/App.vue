<template>
  <div id="books-table"></div>
</template>

<script>
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

export default {
  data() {
    return {
      booksData: [],
    };
  },
  mounted() {
    // Fetch your books data from the JSON file
    fetch("/book-viewer/assets/books.json")
      .then((response) => response.json())
      .then((data) => {
        this.booksData = data;

        // Transform books data into an array format for Handsontable
        const handsontableData = this.booksData.map((book) => [
          `/${book.id}.png`, // Image path for each book
          book.dueDate,
          book.isRenewable ? "✅" : "❌",
          book.accountName,
          book.name,
          book.renewed,
          book.by,
          book.type,
        ]);

        // Custom renderer for image cells
        const imageRenderer = function (
          instance,
          td,
          row,
          col,
          prop,
          value,
          cellProperties
        ) {
          Handsontable.renderers.TextRenderer.apply(this, arguments);
          if (value) {
            td.innerHTML = `<img src="/book-viewer/assets${value}" width="150">`; // Display image in cell
          } else {
            td.innerText = "No Image";
          }
        };

        // Initialize Handsontable
        const container = document.getElementById("books-table");
        new Handsontable(container, {
          data: handsontableData,
          colHeaders: [
            "Cover Image", // Add a column for the cover image
            "Due Date",
            "Renewable",
            "Account Name",
            "Book Name",
            "Renewed",
            "Author",
            "Type",
          ],
          columns: [
            {
              renderer: imageRenderer, // Use the custom image renderer for this column
            },
            {}, // Due Date
            {}, // Renewable
            {}, // Account Name
            {}, // Book Name
            {}, // Renewed
            {}, // Author
            {}, // Type
          ],
          rowHeaders: true,
          colWidths: [150, 120, 200, 150, 100, 200, 200, 100],
          // rowHeights: 23,
          filters: true,
          dropdownMenu: true,
          columnSorting: true,
        });
      });
  },
};
</script>

<style>
#books-table {
  margin: 20px;
}
</style>
