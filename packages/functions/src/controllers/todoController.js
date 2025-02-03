import {getCurrentShop} from '@functions/helpers/auth';
import {
  addTodo,
  deleteTodoByDocId,
  getTodosByShopifyId
} from '@functions/repositories/todoRepository';

/**
 * @param {Context|Object|*} ctx
 * @returns {Promise<{data: *[], total?: number, pageInfo?: {hasNext: boolean, hasPre: boolean, totalPage?: number}}>}
 */
async function getList(ctx) {
  try {
    const shopId = getCurrentShop(ctx);

    return (ctx.body = {data: await getTodosByShopifyId(shopId)});
  } catch (e) {
    console.error(e);
    return (ctx.body = {data: [], error: e.message});
  }
}

/**
 * @param {Object} ctx
 */
async function createTodo(ctx) {
  try {
    const shopId = getCurrentShop(ctx);
    const todoData = ctx.req.body;

    const createdTodoId = await addTodo(shopId, todoData);

    return (ctx.body = {success: true, createdTodoId});
  } catch (e) {
    console.error(e);
    return (ctx.body = {success: false, error: e.message});
  }
}

async function deleteTodo(ctx) {
  try {
    const {todoDocId} = ctx.req.body;

    const deletedTodoId = await deleteTodoByDocId(todoDocId);

    return (ctx.body = {success: true, message: 'Todo deleted', deletedTodoId});
  } catch (e) {
    console.error(e);
    return (ctx.body = {success: false, error: e.message});
  }
}

export {getList, createTodo, deleteTodo};
