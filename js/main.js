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
    methods: {
      addCard() {
        const plannedColumn = this.columns[0];
  
        if (plannedColumn.cards.length < plannedColumn.maxCards) {
          plannedColumn.cards.push({
            title: `Карточка ${plannedColumn.cards.length + 1}`,
            items: [
              { text: 'Задача 1', completed: false },
              { text: 'Задача 2', completed: false },
              { text: 'Задача 3', completed: false },
            ],
          });
        }
      },
      clearAllCards() {
        this.columns.forEach(column => (column.cards = []));
      },
      markComplete(card, itemIndex) {
        if (!card.items[itemIndex].completed) {
          card.items[itemIndex].completed = true;
  
          // Check completion percentage and move to the next column if necessary
          const completedCount = card.items.filter(item => item.completed).length;
          const completionPercentage = (completedCount / card.items.length) * 100;
  
          if (completionPercentage > 50) {
            this.moveCardToNextColumn(card);
          }
        }
      },
      moveCardToNextColumn(card) {
        const columnIndex = this.columns.findIndex(column => column.cards.includes(card));
  
        if (columnIndex !== -1 && columnIndex < this.columns.length - 1) {
          const nextColumn = this.columns[columnIndex + 1];
  
          this.columns[columnIndex].cards.splice(this.columns[columnIndex].cards.indexOf(card), 1);
          nextColumn.cards.push(card);
  
          if (nextColumn.title === 'Сделано' && card.items.every(item => item.completed)) {
            card.completed = true;
            card.timestamp = new Date().toLocaleString();
          }
        }
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
                <input type="checkbox" v-model="item.completed" @change="markComplete(card, itemIndex)">
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
  