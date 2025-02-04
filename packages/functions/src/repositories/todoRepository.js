import {Firestore, FieldValue} from '@google-cloud/firestore';
import {getOrderBy, paginateQuery} from '@functions/repositories/helper';

const firestore = new Firestore();
/** @type CollectionReference */
const collection = firestore.collection('todos');

async function getTodosByShopifyId(shopifyId, query = {}) {
  const {sortField, direction} = getOrderBy(query.sort);

  const {search} = query;

  let queriedRef = collection.where('shopifyId', '==', shopifyId).orderBy(sortField, direction);

  if (search) {
    queriedRef = queriedRef.where('title', '==', search);
  }

  return paginateQuery({queriedRef, collection, query});
}

async function getTodoByDocId(todoDocId) {
  const snapshot = await collection.doc(todoDocId).get();

  if (!snapshot.exists) {
    return false;
  }

  return snapshot;
}

async function addTodo(shopifyId, data) {
  const createdDoc = await collection.add({
    ...data,
    shopifyId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  return createdDoc.id;
}

async function deleteTodoByDocId(todoDocId) {
  await collection.doc(todoDocId).delete();

  return todoDocId;
}

async function saveTodoByDocId(todoDocId, data) {
  await collection.doc(todoDocId).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  });

  return todoDocId;
}

export {getTodosByShopifyId, addTodo, deleteTodoByDocId, saveTodoByDocId};
