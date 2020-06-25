import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    StyleSheet
} from 'react-native';

import MyForm from '../components/MyForm';

const SigninScreens = () => {
    return (
        <KeyboardAvoidingView style={Styles.container}>
            <View style={Styles.logoContainer}>
                <Image style={Styles.logo}
                    source={require('../assets/images/logo.png')}
                />
                <Text style={Styles.title}>MusicRoom</Text>
            </View>
            <View style={Styles.myForm}>
                <MyForm name="Signin" />
            </View>
            <View style={Styles.txtLine}>
                <Text style={Styles.txtLine}>----------------- Signin or signup --------------------</Text>
            </View>
        </KeyboardAvoidingView>
    )
}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#282830',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    logoContainer: {
        color: 'white',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 100,
        height: 100
    },
    title: {
        color: '#fff',
        marginTop: 20,
        fontWeight: "100",
        fontSize: 23
    },
    myForm: {
        flex: 3
    },
    txtLine: {
        flex: 2,
        color: '#fff',
    }
})


export default SigninScreens;