import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  PermissionsAndroid,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-community/async-storage";

import { ModalSelectList } from "react-native-modal-select-list";

// Import context
import { Context as AuthContext } from "../context/AuthContext";
import { Card, Tile, ListItem, Button, Header } from "react-native-elements";
import FavOff from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/AntDesign";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Sound, { setCategory } from "react-native-sound";

// Import servces
import {
  updateTrackListPositionService,
  updateTrackLikeService,
  getPlaylistByidService,
} from "../service/playListService";

import BackWard from "react-native-vector-icons/Ionicons";
import Marker from "react-native-vector-icons/MaterialCommunityIcons";
import Geolocation from "react-native-geolocation-service";

const EventDetails = ({ navigation, route }) => {
  const {
    address: { coords },
  } = route.params;
  const { state } = useContext(AuthContext);
  const [coordsUser, setCoordsUser] = useState({});
  const [rightToVote, setRightToVote] = useState(false);
  const [listDetails, setDetails] = useState({});
  const [trackList, setTrackList] = useState([]);
  const [songsList, setSongsList] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(0);
  const [rerender, setRerender] = useState(0);
  const [userPerms, setUserPerms] = useState({});
  const [sound, setSound] = useState(false);

  useEffect(() => {
    if (route.params?.newCoordsUser) {
      setCoordsUser(route.params?.newCoordsUser);
    } else {
      getPermissions();
    }
  }, [route.params?.newCoordsUser]);

  useEffect(() => {
    if (Object.keys(coordsUser).length > 0) {
      const { latitude, longitude } = coordsUser;
      const distance = 1; // In km
      const userPosition = calculDistance(
        latitude,
        longitude,
        coords.latitude,
        coords.longitude
      );
      console.log(userPosition, distance, " distance");
      setRightToVote(userPosition < distance ? true : false);
    }
  }, [coordsUser]);

  const handlSongsList = (list) => {
    let data = [];
    if (list && list.length > 0) {
      list.map((l, i) => {
        data.push({
          preview: l.preview,
          position: i,
          likes: l.likes,
          selected: false,
          label: (i + 1).toString(),
          value: i.toString(),
        });
      });
    }

    setSongsList(data);
  };

  const handlLikeList = (list) => {
    let data = list.sort(
      (a, b) => parseInt(a.likes.length) < parseInt(b.likes.length)
    );

    let dataNew = [];
    if (data && data.length > 0) {
      data.map((l, i) => {
        dataNew.push({
          preview: l.preview,
          position: i,
          likes: l.likes,
          selected: false,
          label: (i + 1).toString(),
          value: i.toString(),
        });
      });
    }
    setTrackList(data);
    setSongsList(dataNew);
  };

  useEffect(() => {
    if (route.params?.playListDetails) {
      let dataIn = JSON.parse(route.params.playListDetails);
      console.log(dataIn.creator, " id creator");
      getPlaylistByidService("5f15a777c99c9b002086847d", state.token).then(
        (data) => {
          if (data.playList) {
            setDetails(data.playList);
            setTrackList(data.playList.trackList.sort((a) => a.position));
            if (data.playList.public === false) {
              AsyncStorage.getItem("userInfo").then((user) => {
                let userInfo = JSON.parse(user);
                let perms = {};
                if (data.playList.contributors) {
                  let dt = data.playList.contributors;
                  dt.map((collab) => {
                    if (collab.id === userInfo.userId) perms = collab;
                  });
                }
                setUserPerms(perms);
              });
            }
            if (data.playList.isEditable)
              handlSongsList(data.playList.trackList);
            else {
              handlLikeList(data.playList.trackList);
            }
          }
        }
      );
    }
  }, [route.params.playListDetails]);

  useEffect(() => {
    if (rerender !== 0) {
      setTrackList(trackList);
    }
  }, [rerender]);

  const startPlay = (i) => {
    if (isPlaying) {
      pause();
      setIsPlaying(false);
    }
    setCurrentSong(i);
    if (songsList[i])
      var sound1 = new Sound(songsList[i].preview, "", (error, sound) => {
        if (error) {
          alert("error" + error.message);
          return;
        }
        setIsPlaying(true);
        setSound(sound1);
        sound1.play(() => {
          sound1.release();
          if (parseInt(i) + 1 < songsList.length) {
            setCurrentSong(i + 1);
            startPlay(i + 1);
          } else {
            setCurrentSong(0);
            startPlay(0);
          }
        });
      });
  };

  const pause = (i) => {
    if (sound) {
      sound.pause();
    }
    setIsPlaying(false);
  };

  const handleLikePress = async (id, track) => {
    let user = JSON.parse(await AsyncStorage.getItem("userInfo"));
    if (track.likes.indexOf(user.userId) === -1) {
      trackList[id].likes.push(user.userId);
    } else {
      trackList[id].likes.splice(trackList[id].likes.indexOf(user.userId), 1);
    }

    handlLikeList(trackList);
    // await setTrackList(trackList);
    setRerender(Math.floor(Math.random() * 999999999));
    await updateTrackLikeService(listDetails._id, track, state.token);
  };

  let modalRef;
  const openModal = () => modalRef.show();
  const saveModalRef = (ref) => (modalRef = ref);
  const onSelectedOption = async (newPos) => {
    let data = songsList;
    // Get old position
    let oldPos = data.filter((l) => l.selected)[0].position;
    if (parseInt(oldPos) !== parseInt(newPos)) {
      let arrangedTrack = array_move(trackList, oldPos, newPos);
      setTrackList(arrangedTrack);

      let newListTr = listDetails;
      newListTr.trackList = arrangedTrack;
      setDetails(newListTr);
      handlSongsList(arrangedTrack);
      await updateTrackListPositionService(
        newListTr._id,
        arrangedTrack,
        state.token
      );
      // Force renderer
      setRerender(Math.floor(Math.random() * 9999999999));
    }
  };

  const array_move = (arr, old_index, new_index) => {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  };

  const handleEditPosPress = (pos, track) => {
    let data = songsList;

    for (let i = 0; i < data.length; i++) {
      if (i === parseInt(pos)) {
        data[i].label = (data[i].position + 1).toString() + " current position";
        data[i].selected = true;
      } else {
        data[i].label = (data[i].position + 1).toString();
        data[i].selected = false;
      }
    }
    setSongsList(data.sort((a) => a.position));
    openModal();
  };

  const calculDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 === lat2 && lon1 === lon2) {
      return 0;
    } else {
      const radLat1 = (Math.PI * lat1) / 180;
      const radLat2 = (Math.PI * lat2) / 180;
      const theta = lon1 - lon2;
      const radTheta = (Math.PI * theta) / 180;
      let distance =
        Math.sin(radLat1) * Math.sin(radLat2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
      if (distance > 1) {
        distance = 1;
      }
      distance = Math.acos(distance);
      distance = (distance * 180) / Math.PI;
      distance = distance * 60 * 1.1515;
      distance = distance * 1.609344;
      return distance;
    }
  };

  const getPermissions = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "ReactNativeCode Location Permission",
        message: "ReactNativeCode App needs access to your location ",
      }
    );
    if (granted) {
      Geolocation.getCurrentPosition(
        (position) => {
          const {
            coords: { longitude, latitude },
          } = position;
          setCoordsUser({ longitude, latitude });
        },
        (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  };

  return (
    <ScrollView style={Styles.container}>
      <ModalSelectList
        ref={saveModalRef}
        placeholder={"Text something..."}
        closeButtonText={"Close"}
        options={songsList}
        onSelectedOption={onSelectedOption}
        disableTextSearch={false}
      />
      <View>
        <Header
          backgroundColor="#633689"
          centerComponent={{ text: "EventDetails", style: { color: "#fff" } }}
          leftComponent={
            <BackWard
              onPress={() => navigation.goBack()}
              name="md-arrow-back"
              size={24}
              color="white"
            />
          }
          rightComponent={
            <Marker
              onPress={() =>
                navigation.push("Map", { coordsEvent: coords, coordsUser })
              }
              name="map-marker-radius"
              size={24}
              color="white"
            />
          }
        />
        <Tile
          imageSrc={require("../assets/music.jpg")}
          title={listDetails.name}
          featured
          caption={listDetails.desctiption}
        />

        <Button
          onPress={() =>
            !isPlaying ? startPlay(currentSong) : pause(currentSong)
          }
          icon={
            <Icon
              name={!isPlaying ? "play" : "pause"}
              size={25}
              color="white"
            />
          }
          iconLeft
          title="  Start playlist"
        />

        {listDetails.public == true && listDetails.trackList && trackList ? (
          trackList.map((l, i) => (
            <ListItem
              key={i}
              leftAvatar={{
                source: { uri: l.album ? l.album.cover_big : null },
              }}
              title={l.title}
              // subtitle={l.subtitle}
              bottomDivider
              rightTitle={listDetails.isVote ? l.likes.length.toString() : null}
              rightIcon={
                listDetails.isVote ? (
                  <SimpleLineIcons
                    onPress={() =>
                      rightToVote
                        ? handleLikePress(i, l)
                        : Alert.alert("You are not in the right place !")
                    }
                    name="like"
                    size={25}
                    color="blue"
                  />
                ) : listDetails.isEditable ? (
                  <SimpleLineIcons
                    onPress={() => handleEditPosPress(i, l)}
                    name="cursor-move"
                    size={25}
                    color="blue"
                  />
                ) : null
              }
              leftIcon={
                i === currentSong && isPlaying ? (
                  <SimpleLineIcons
                    name="control-pause"
                    size={25}
                    color="blue"
                    onPress={() => pause(i)}
                  />
                ) : (
                  <SimpleLineIcons
                    name="control-play"
                    size={24}
                    color="blue"
                    onPress={() => startPlay(i)}
                  />
                )
              }
            />
          ))
        ) : listDetails.public == false &&
          listDetails.trackList &&
          trackList ? (
          trackList.map((l, i) => (
            <ListItem
              key={i}
              leftAvatar={{
                source: { uri: l.album ? l.album.cover_big : null },
              }}
              title={l.title}
              // subtitle={l.subtitle}
              bottomDivider
              rightTitle={
                listDetails.isVote && userPerms.canVote
                  ? l.likes.length.toString()
                  : null
              }
              rightIcon={
                listDetails.isVote && userPerms.canVote ? (
                  <SimpleLineIcons
                    onPress={() =>
                      rightToVote
                        ? handleLikePress(i, l)
                        : Alert.alert("You are not in the right place !")
                    }
                    name="like"
                    size={25}
                    color="blue"
                  />
                ) : listDetails.isEditable && userPerms.canEdit ? (
                  <SimpleLineIcons
                    onPress={() => handleEditPosPress(i, l)}
                    name="cursor-move"
                    size={25}
                    color="blue"
                  />
                ) : null
              }
              leftIcon={
                i === currentSong && isPlaying ? (
                  <SimpleLineIcons
                    name="control-pause"
                    size={25}
                    color="blue"
                    onPress={() => pause(i)}
                  />
                ) : (
                  <SimpleLineIcons
                    name="control-play"
                    size={24}
                    color="blue"
                    onPress={() => startPlay(i)}
                  />
                )
              }
            />
          ))
        ) : (
          <Text>Empty list</Text>
        )}
      </View>
    </ScrollView>
  );
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#282830",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  logoContainer: {
    color: "white",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
  },
  checkBoxStyle: {
    flex: 0.2,
  },
  title: {
    color: "#fff",
    marginTop: 20,
    fontWeight: "100",
    fontSize: 23,
  },
  myForm: {
    flex: 3,
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
  buttonModal: {
    marginTop: 10,
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    // elevation: 2,
  },
});

export default EventDetails;