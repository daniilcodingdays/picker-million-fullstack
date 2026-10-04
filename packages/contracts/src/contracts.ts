/** Количество элементов, загружаемых на одной странице (размер порции данных для пагинации) */
export const PAGE_SIZE = 20

/** Максимально допустимая длина ID */
export const MAX_NUMBER = 999_999_999_999_999
export const MAX_ID_LENGTH = String(MAX_NUMBER).length;

/** Тип данных для уникального идентификатора элемента */
export type ItemId = number

/** Параметры, отправляемые на сервер для запроса конкретной страницы списка */
export interface PageQuery {
  query: string
  after: ItemId | null
}

/** Структура данных одной страницы списка, возвращаемая сервером */
export interface Page {
  ids: ItemId[]
  hasMore: boolean
  total: number
}

/** Тело запроса (Payload) для операции добавления нового элемента */
export interface AddItemRequest {
  id: ItemId
}

/** Ответ сервера на успешное добавление элемента */
export interface AddItemResponse {
  appliesInMs: number
}

/**
 * Тип позиционирования для операции перемещения элементов.
 * before - вставить перед опорным элементом, after - вставить после него.
 */
export type Placement = 'before' | 'after'

/** Тело запроса (Payload) для изменения порядка или перемещения элемента в списке */
export interface MoveRequest {
  anchorId: ItemId
  placement: Placement
}

/** Универсальная структура ответа сервера в случае возникновения ошибки (API Error) */
export interface ErrorResponse {
  message: string
}

/**
 * Проверяет, соответствует ли элемент текущему поисковому запросу.
 * Возвращает true, если строка поиска пустая, либо если ID элемента содержит в себе поисковую строку как подстроку.
 */
export const matchesQuery = (id: ItemId, query: string): boolean =>
  query === '' || String(id).includes(query)
