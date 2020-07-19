import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
  Alert,
  Modal,
  Button,
  Keyboard,
} from "react-native";
import DatetimePicker from "@react-native-community/datetimepicker";
import { Header } from "react-native-elements";
import CheckBox from "@react-native-community/checkbox";
import axios from "axios";

import Save from "react-native-vector-icons/Entypo";
import BackWard from "react-native-vector-icons/Ionicons";

import { Context as AuthContext } from "../context/AuthContext";
import { getMyPlayList, saveNewEventService } from "../service/eventService";

const apiKeyGeocoder = "2fc143fb400c48a38e3479e0dfd66278";

const EventEditor = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [startEvent, setStartEvent] = useState(false);
  const [endEvent, setEndEvent] = useState(false);
  const [playLists, setPlayLists] = useState([]);
  const [playListChecked, setPlayListChecked] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);
  const [modalContributorVisible, setModalContributorVisible] = useState(false);
  const [contributor, setContributor] = useState("");
  const [contributors, setContributors] = useState([]);
  const [allAddress, setAllAddress] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const lastUpdateTime = useRef(null);
  const typingInterval = useRef(null);
  const [isVote, setIsVote] = useState(true);
  const [isEditable, setIsEditable] = useState(false);


  const {
    state: { token },
  } = useContext(AuthContext);

  useEffect(() => {
    fetchPlayLists();
  }, []);

  useEffect(() => {
    Keyboard.addListener("keyboardDidHide", keyboardHide);
    return () => {
      Keyboard.removeListener("keyboardDidHide", keyboardHide);
    };
  }, []);

  const keyboardHide = () => {
    setAllAddress([]);
  };

  const fetchPlayLists = async () => {
    try {
      let response = await getMyPlayList(token);
      setPlayLists(response.playListArray);
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeStart = (e, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setStartEvent(Platform.OS === "ios");
    setStartDate(currentDate);
    currentDate > endDate && setEndDate(currentDate);
  };

  const onChangeEnd = (e, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setEndEvent(Platform.OS === "ios");
    currentDate > startDate && setEndDate(currentDate);
  };

  const showMode = (currentMode, setEvent) => {
    setEvent(true);
    setMode(currentMode);
  };

  const formatDate = (date) => {
    const seconds = new Date(date);
    const dateStr =
      ("00" + seconds.getDate()).slice(-2) +
      "/" +
      ("00" + (seconds.getMonth() + 1)).slice(-2) +
      "/" +
      seconds.getFullYear();
    return dateStr;
  };

  const formatHour = (date) => {
    const seconds = new Date(date);
    const dateStr =
      ("00" + seconds.getHours()).slice(-2) +
      ":" +
      ("00" + seconds.getMinutes()).slice(-2) +
      ":" +
      ("00" + seconds.getSeconds()).slice(-2);
    return dateStr;
  };

  const saveEvent = async () => {
    const { trackList, name, creator } = playLists[playListChecked];
    let data = {
      name: title,
      description,
      public: isPrivate,
      trackList, // Musique
      creator, // id of user
      name, // Name of playlist
      dateStartEvent: `${formatDate(startDate)} ${formatHour(startDate)}`, // dd/mm/yyyy hh:mm:ss
      dateEndEvent: `${formatDate(endDate)} ${formatHour(endDate)}`, // dd/mm/yyyy hh:mm:ss
      address,
      isVote,
      isEditable
    };
    console.log(data);
    await saveNewEventService(data, token)
  };

  const addContributor = () => {
    contributor.trim() !== "" &&
      setContributors([...contributors, contributor]);
    setContributor("");
    setModalContributorVisible(false);
  };

  const getAddress = async () => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${address}&key=${apiKeyGeocoder}&language=fr&pretty=1`
      );
      address.length > 0 && setAllAddress(response.data.results);
      address.length === 0 && setAllAddress([]);
    } catch (error) {
      console.log(error);
      setAllAddress([]);
    }
  };

  const startTyping = () => {
    typingInterval.current = setInterval(() => {
      if (Date.now() - lastUpdateTime.current > 300) {
        getAddress();
        stopCheckingTyping();
        setIsTyping(false);
      } else {
      }
    });
  };

  const stopCheckingTyping = () => {
    if (typingInterval.current) {
      clearInterval(typingInterval.current);
    }
  };

  const typingIsProgress = () => {
    lastUpdateTime.current = Date.now();
    if (!isTyping) {
      startTyping();
      setIsTyping(true);
    }
  };

  const setDataAddress = (address) => {
    setAddress(address);
    setAllAddress([]);
  };

  return (
    <View style={styles.container}>
      <Header
        backgroundColor="#633689"
        centerComponent={{ text: "Event", style: { color: "#fff" } }}
        leftComponent={
          <BackWard
            onPress={() => navigation.goBack()}
            name="md-arrow-back"
            size={24}
            color="white"
          />
        }
        rightComponent={
          <Save
            onPress={() => saveEvent()}
            name="save"
            size={24}
            color="white"
          />
        }
      />
      <View style={styles.textInputContainer}>
        {modalContributorVisible && (
          <View>
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalContributorVisible}
              onRequestClose={() => Alert.alert("Modal has been closed !")}
            >
              <View style={styles.modalContainer}>
                <View
                  style={[styles.textContainer, { width: 300, height: 200 }]}
                >
                  {/* set width and height with dimensions */}
                  <TextInput
                    onChangeText={(text) => setContributor(text)}
                    value={contributor}
                    style={styles.textInput}
                  />
                  <View style={{ marginTop: 10 }}>
                    <Button
                      title="Add contributor"
                      onPress={() => addContributor()}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Button
                      title="Close"
                      onPress={() => setModalContributorVisible(false)}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
        <Text style={styles.text}>Title</Text>
        <TextInput
          onChangeText={(text) => setTitle(text)}
          value={title}
          style={styles.textInput}
        />
      </View>
      <View style={styles.textInputContainer}>
        <Text style={styles.text}>Description</Text>
        <TextInput
          onChangeText={(text) => setDescription(text)}
          value={description}
          style={styles.textInput}
        />
      </View>
      <View style={[styles.textInputContainer]}>
        <Text style={styles.text}>Address</Text>
        <View style={{ flex: 0.75, height: 40 }}>
          <TextInput
            onChangeText={(text) => setAddress(text)}
            value={address}
            style={[styles.textInput, { flex: 1 }]}
            onKeyPress={() => typingIsProgress()}
            onSubmitEditing={Keyboard.dismiss}
          />
          {/* <Button title="Envoie" onPress={() => getAddress()} /> */}
          {allAddress.length > 0 ? (
            <View style={styles.addressContainer}>
              {allAddress.map((address, index) => (
                <View key={index}>
                  <Text
                    onPress={() => setDataAddress(address.formatted)}
                    style={styles.textAddress}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {address.formatted}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
      {/* <Button title="Close" onPress={() => getAddress()} /> */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 15,
          }}
        >
          <View>
            <TouchableOpacity
              style={styles.buttonDate}
              onPress={() => showMode("date", setStartEvent)}
            >
              <Text style={styles.textDate}>{`Start date: ${formatDate(
                startDate
              )}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonDate}
              onPress={() => showMode("time", setStartEvent)}
            >
              <Text style={styles.textDate}>{`Start hour: ${formatHour(
                startDate
              )}`}</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              style={styles.buttonDate}
              onPress={() => showMode("date", setEndEvent)}
            >
              <Text style={styles.textDate}>{`End date: ${formatDate(
                endDate
              )}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonDate}
              onPress={() => showMode("time", setEndEvent)}
            >
              <Text style={styles.textDate}>{`End hour: ${formatHour(
                endDate
              )}`}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {startEvent && (
          <DatetimePicker
            testID="dateTimePicker"
            value={startDate}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChangeStart}
          />
        )}
        {endEvent && (
          <DatetimePicker
            testID="dateTimePicker"
            value={endDate}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={onChangeEnd}
          />
        )}
      </View>
      <View
        style={{
          flex: 0.2,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 0.5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckBox
            style={{ flex: 0.2 }}
            value={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />
          <Text style={{ color: "white", flex: 0.6 }}>Set private !</Text>
        </View>
        {isPrivate ? (
          <View style={{ marginTop: 15, flex: 0.5, alignSelf: "center" }}>
            <TouchableOpacity
              style={styles.buttonDate}
              onPress={() => setModalContributorVisible(true)}
            >
              <Text style={styles.textDate}>Invite user in my event</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isPrivate ? (
          <View style={{ marginTop: 15, flex: 1, alignSelf: "center" }}>
            <View
              style={{
                flex: 0.5,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckBox
                style={styles.checkBoxStyle}
                // disabled={false}
                onChange={() => { !isVote ? setIsEditable(false) : null, setIsVote(!isVote) }}
                value={isVote}
              />
              <Text style={{ color: "white", flex: 0.6 }}>Set vote !</Text>
            </View>
            <View
              style={{
                flex: 0.5,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckBox
                style={styles.checkBoxStyle}
                // disabled={false}
                value={isEditable}
                onChange={() => { !isEditable ? setIsVote(false) : null, setIsEditable(!isEditable) }}
              />
              <Text style={{ color: "white", flex: 0.6 }}>Set editable !</Text>
            </View>
          </View>
        ) : null}

      </View>
      <View style={styles.playListsContainer}>
        <Text style={{ textAlign: "center", marginBottom: 10, marginTop: 10 }}>
          My playlist:
        </Text>
        <FlatList
          data={playLists}
          renderItem={({ item: { desctiption, name }, index }) => (
            <View style={styles.itemContainer}>
              <CheckBox
                style={{ flex: 0.1 }}
                value={playListChecked === index}
                onChange={() => setPlayListChecked(index)}
              />
              <Text style={{ flex: 0.4 }}>{`Name: ${name}`}</Text>
              <Text style={{ flex: 0.4 }}>{`Description: ${desctiption}`}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282830",
  },
  textInput: {
    flex: 0.75,
    height: 40,
    backgroundColor: "white",
    borderWidth: 1,
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    marginLeft: 10,
    flex: 0.2,
    color: "white",
  },
  buttonDate: {
    // elevation: 8,
    backgroundColor: "#841584",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: 150,
    marginBottom: 10,
  },
  textDate: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  playListsContainer: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 15,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  textContainer: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkBoxStyle: {
    flex: 0.2
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
  },
  addressContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    flex: 1,
    elevation: 10,
    zIndex: 10,
    backgroundColor: "white",
  },
  textAddress: {
    flex: 1,
    marginTop: 10,
    borderBottomColor: "grey",
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
});

export default EventEditor;
