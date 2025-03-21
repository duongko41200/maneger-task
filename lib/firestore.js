import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Hàm thêm dữ liệu
export const addTask = async (task) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), task);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

// Hàm lấy dữ liệu
export const getTasks = async () => {
  const querySnapshot = await getDocs(collection(db, "tasks"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
