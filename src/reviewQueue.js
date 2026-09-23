/**
 * SUTRA - Analyst Human-in-the-Loop Review Queue
 * Manages flagged intelligence leads, low-confidence entities, and suspicious link patterns.
 */

export class ReviewQueue {
  constructor(initialItems, onQueueChange) {
    this.items = [...initialItems];
    this.onQueueChange = onQueueChange || (() => {});
  }

  setItems(items) {
    this.items = [...items];
  }

  approveItem(itemId, notes = '') {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return false;

    item.status = 'Approved (Verified)';
    item.analystNotes = notes || 'Verified as valid intelligence lead by case investigator.';
    item.actionTimestamp = new Date().toISOString();
    this.onQueueChange(item, 'APPROVE');
    return true;
  }

  rejectItem(itemId, notes = '') {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return false;

    item.status = 'Rejected (False Positive)';
    item.analystNotes = notes || 'Rejected by investigator; marked as coincidental noise.';
    item.actionTimestamp = new Date().toISOString();
    this.onQueueChange(item, 'REJECT');
    return true;
  }

  updateNotes(itemId, notes) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.analystNotes = notes;
      this.onQueueChange(item, 'NOTE');
    }
  }

  getItems() {
    return this.items;
  }

  getPendingCount() {
    return this.items.filter(i => i.status === 'Pending').length;
  }
}
