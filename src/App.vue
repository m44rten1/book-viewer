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
          book.accountName,
          book.name,
          book.renewed,
          book.dueDate,
          book.by,
          book.type,
          book.isRenewable ? "✅" : "❌",
          `/${book.id}.png`, // Image path for each book
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
            "Account Name",
            "Book Name",
            "Renewed",
            "Due Date",
            "Author",
            "Type",
            "Renewable",
            "Cover Image", // Add a column for the cover image
          ],
          columns: [
            {}, // Account Name
            {}, // Book Name
            {}, // Renewed
            {}, // Due Date
            {}, // Author
            {}, // Type
            {}, // Renewable
            {
              renderer: imageRenderer, // Use the custom image renderer for this column
            },
          ],
          rowHeaders: true,
          colWidths: [120, 200, 100, 100, 200, 200, 100, 150],
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
