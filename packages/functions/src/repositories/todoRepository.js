import {Firestore, FieldValue} from '@google-cloud/firestore';

const firestore = new Firestore();
/** @type CollectionReference */
const collection = firestore.collection('todos');

async function getTodosByShopifyId(shopifyId) {
  const snapshot = await collection.where('shopifyId', '==', shopifyId).get();
  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    return {
      id: doc.id,
      ...doc.data()
    };
  });
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
  const snapshot = await collection.doc(todoDocId).get();

  if (!snapshot.exists) {
    return false;
  }

  await snapshot.ref.delete();

  return snapshot.id;
}

export {getTodosByShopifyId, addTodo, deleteTodoByDocId};
