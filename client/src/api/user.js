import Axios from 'axios';

const BASE_URL = process.env.BASE_URL;
const VERSION_API = process.env.REACT_APP_API_VERSION;

// TODO CHECK WHY ENV NOT DETECTING
export default Axios.create({
    baseURL: "http://192.168.42.120:3000/api/v1/"
})
