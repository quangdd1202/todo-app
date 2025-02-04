import {getCurrentShop} from '@functions/helpers/auth';
import {
  addTodo,
  deleteTodoByDocId,
  getTodosByShopifyId,
  saveTodoByDocId
} from '@functions/repositories/todoRepository';

async function getList(ctx) {
  try {
    const shopId = getCurrentShop(ctx);
    const query = ctx.query;

    return (ctx.body = {success: true, ...(await getTodosByShopifyId(shopId, query))});
  } catch (e) {
    console.error(e);
    return (ctx.body = {success: false, data: [], error: e.message});
  }
}

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

async function editTodo(ctx) {
  try {
    const {id: todoDocId, ...data} = ctx.req.body;

    const updatedTodoId = await saveTodoByDocId(todoDocId, data);

    return (ctx.body = {success: true, message: 'Todo updated', updatedTodoId});
  } catch (e) {
    console.error(e);
    return (ctx.body = {success: false, error: e.message});
  }
}

export {getList, createTodo, deleteTodo, editTodo};
