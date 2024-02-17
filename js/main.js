Vue.component('note-card', {
  data() {
    return {
      columns: [
        { title: 'Запланировано', maxCards: 5, cards: [] },
        { title: 'Выполнено', maxCards: 3, cards: [] },
        { title: 'Сделано', cards: [] },
      ],
    };
  },
  computed: {
    column2Full() {
      return this.columns[1].cards.length >= 5;
    },
  },
  mounted() {
    if (localStorage.getItem('noteData')) {
      const savedData = JSON.parse(localStorage.getItem('noteData'));
      this.columns = savedData.columns;
    }
  },
  methods: {
    addCard() {
      if (!this.column2Full) {
        this.columns[0].cards.push({
          title:`Карточка ${this.columns[0].cards.length + 1}`,
          items: [
            { text: 'Пункт 1', checked: false },
            { text: 'Пункт 2', checked: false },
            { text: 'Пункт 3', checked: false },
          ],
        });
        this.saveData();
      } else {
        alert("Нельзя добавить карточку во второй столбец из-за достижения лимита.");
      }
    },
    clearAllCards() {
      this.columns.forEach(column => (column.cards = []));
      this.saveData();
    },
    markComplete(card, itemIndex) {
      if (!card.items[itemIndex].checked) {
        card.items[itemIndex].checked = true;

        const completedCount = card.items.filter(item => item.checked).length;
        const totalCount = card.items.length;
        const completionPercentage = (completedCount / totalCount) * 100;

        if (completionPercentage >= 50) {
          this.moveCardToNextColumn(card);
        }
        this.saveData();
      }
    },
    moveCardToNextColumn(card) {
      const columnIndex = this.columns.findIndex(column => column.cards.includes(card));

      if (columnIndex !== -1 && columnIndex < this.columns.length - 1) {
        const nextColumn = this.columns[columnIndex + 1];

        this.columns[columnIndex].cards.splice(this.columns[columnIndex].cards.indexOf(card), 1);
        nextColumn.cards.push(card);

        if (nextColumn.title === 'Сделано' && card.items.every(item => item.checked)) {
          card.completed = true;
          card.timestamp = new Date().toLocaleString();
        }
        this.saveData();
      }
    },
    checkItem(card) {
      const completedCount = card.items.filter(item => item.checked).length;
      const totalCount = card.items.length;
      const completionPercentage = (completedCount / totalCount) * 100;

      if (completionPercentage >= 50 && this.columns[0].cards.includes(card)) {
        this.moveCardToNextColumn(card);
      } else if (completionPercentage >= 100 && this.columns[1].cards.includes(card)) {
        this.moveCardToNextColumn(card);
      } else if (completionPercentage < 50 && this.columns[2].cards.includes(card)) {
        this.moveCardToNextColumn(card);
      }
    },
    saveData() {
      localStorage.setItem('noteData', JSON.stringify({ columns: this.columns }));
    },
  },
  template: `
    <div>
      <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="column">
        <h2>{{ column.title }}</h2>
        <div v-for="(card, cardIndex) in column.cards" :key="cardIndex" class="note-card">
          <h3>{{ card.title }}</h3>
          <ul>
            <li v-for="(item, itemIndex) in card.items" :key="itemIndex">
              <input type="checkbox" v-model="item.checked" @change="markComplete(card, itemIndex)">
              {{ item.text }}
            </li>
          </ul>
          <div v-if="column.title === 'Сделано' && card.completed">
            <p>Дата и время последнего выполненного пункта: {{ card.timestamp }}</p>
          </div>
        </div>
      </div>
      <button @click="addCard">Добавить карточку</button>
      <button @click="clearAllCards">Очистить все карточки</button>
    </div>
  `,
});

new Vue({
  el: '#app',
  template: '<note-card></note-card>',
});