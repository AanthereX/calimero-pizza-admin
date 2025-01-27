import { doc, getDoc } from "firebase/firestore";
import { db } from "../configs/firebase/index.js";

export const getDocById = async (collection, id) => {
  const docRef = doc(db, collection, id);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error("Document does not exist");
    }
  } catch (error) {
    throw new Error(error);
  }
};
