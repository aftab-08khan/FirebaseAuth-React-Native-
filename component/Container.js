import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  Keyboard,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../context/themeContext";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase.config";
import UploadImageComponent from "./UploadImage";
import { useUser } from "../context/UserContext";
import Heading from "./Heading";
import { Ionicons } from "@expo/vector-icons";

const Container = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [languageName, setLanguageName] = useState("");
  const { handleDismissKeyboard, mode, setImageUri, imageUri } = useTheme();
  const [languagesData, setLanguagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { admin } = useUser();

  const handleSubmit = async () => {
    if (!languageName.trim()) {
      Alert.alert();
      return;
    }

    try {
      await addDoc(collection(db, "languages"), {
        languageName: languageName.trim(),
        imageUri,
        createdAt: new Date(),
      });
      Alert.alert("Success", "Language added successfully!");
      fetchLanguagesData();
      setIsVisible(false);
      setLanguageName("");
      setImageUri(null);
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred.");
    }
  };

  const fetchLanguagesData = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "languages"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLanguagesData(data);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch data.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "languages", id));
      setLanguagesData((prev) => prev.filter((item) => item.id !== id));
      Alert.alert("Success", "Language deleted successfully!");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to delete language.");
    }
  };

  useEffect(() => {
    fetchLanguagesData();
  }, []);

  const renderLanguageItem = ({ item }) =>
    item ? (
      <TouchableOpacity
        style={[
          styles.languageItem,
          { backgroundColor: mode === true ? "#fff" : "#292f3d" },
        ]}
        onPress={() =>
          navigation.navigate("LanguageProfile", {
            languageName: item.languageName,
          })
        }
      >
        <Text
          style={[
            { color: mode === false ? "#fff" : "#191c25" },
            styles.languageName,
          ]}
        >
          {item.languageName}
        </Text>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.icon} />
        ) : (
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Ionicons
              name="folder-outline"
              size={80}
              color={mode === true ? "#191c25" : "#fff"}
              // style={styles.icon}
            />
          </View>
        )}
        {admin === true ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete this language?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", onPress: () => handleDelete(item.id) },
                ]
              );
            }}
          >
            {admin === true ? (
              <Text
                style={[
                  styles.deleteText,
                  { color: mode === false ? "#fff" : "#191c25" },
                ]}
              >
                Delete
              </Text>
            ) : (
              ""
            )}
          </TouchableOpacity>
        ) : (
          ""
        )}
      </TouchableOpacity>
    ) : (
      <Text>Add a new Data</Text>
    );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.main,
          mode === false ? styles.darkMode : styles.lightMode,
        ]}
      >
        <View style={styles.flex}>
          <Heading textColor={mode === false ? "#ffff" : "#1d212b"}>
            Languages
          </Heading>
          {/* {admin && (
            <TouchableOpacity
              style={styles.pulseButton}
              onPress={() => setIsVisible(true)}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          )} */}
          <TouchableOpacity
            style={styles.pulseButton}
            onPress={() => setIsVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={languagesData}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
          />
        )}

        <Modal
          visible={isVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsVisible(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>Add New Language</Text>

              <View style={styles.formContainer}>
                <Text style={styles.label}>Language Name</Text>
                <TextInput
                  placeholder="Enter Language Name"
                  value={languageName}
                  onChangeText={setLanguageName}
                  style={styles.input}
                  placeholderTextColor="#aaa"
                />

                <UploadImageComponent
                  setImageUri={setImageUri}
                  imageUri={imageUri}
                />
              </View>

              <View style={styles.btnContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Container;
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#414652",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
    marginBottom: 15,
  },
  lightMode: {
    backgroundColor: "#fff",
  },
  darkMode: {
    backgroundColor: "#3e4450",
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 2,
    borderColor: "#414652",
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  btnContainer: {
    justifyContent: "space-between",
    gap: 10,
  },
  submitButton: {
    width: "100%",
    backgroundColor: "#5A9BFC",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: { width: 20, height: 20 },
  cancelButton: {
    width: "100%",
    backgroundColor: "#FC5A5A",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  main: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#1d212b",
    shadowOffset: 7,
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  flex: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pulseButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListContainer: {
    paddingHorizontal: 10,
    marginTop: 20,
  },
  languageItem: {
    width: 150,
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    alignItems: "center",
    shadowColor: "#292f3d",
    shadowOffset: 7,
    shadowOpacity: 0.6,
    shadowRadius: 2,
    marginBottom: 12,
  },
  languageName: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
    marginBottom: 12,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  btnBox: {
    gap: 12,
  },

  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
});
