import type { ItemId } from '@picker/contracts'

export class ItemNotFoundError extends Error {
  constructor(id: ItemId) {
    super(`Элемент ${id} не существует`)
  }
}

export class DuplicateItemError extends Error {
  constructor(id: ItemId) {
    super(`Элемент ${id} уже существует`)
  }
}

export class CursorNotFoundError extends Error {
  constructor(id: ItemId) {
    super(`Элемент ${id} больше не выбран`)
  }
}

export class QueueOverflowError extends Error {
  constructor() {
    super('Слишком много ожидающих запросов, повторите попытку через некоторое время')
  }
}