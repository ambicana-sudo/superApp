import React, { useState, useRef } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Autocomplete,
} from "@react-google-maps/api";
import {
    setSenderCoordinates,
    setReceiverCoordinates,
    setOrdersDetails,
} from "../redux/reducers/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const containerStyle = {
    width: "100%",
    height: "100vh",
};

const center = {
    lat: 27.685616312450417,
    lng: 85.34456349960001,
};

const SendOrders = () => {
    const { senderCoordinates, receiverCoordinates, ordersDetails } = useSelector((state) => state.location);

    const [isSenderFormActive, setIsSenderFormActive] = useState(true);
    const [senderAddress, setSenderAddress] = useState(ordersDetails?.senderAddress);
    const [receiverAddress, setReceiverAddress] = useState(ordersDetails?.receiverAddress);
    // const [receiverPhoneNumber, setReceiverPhoneNumber] = useState(ordersDetails?.receiverPhoneNumber);
    // const [receiverName, setReceiverName] = useState(ordersDetails?.receiverName);


    const dispatch = useDispatch();

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });
    const [currentCoordinates, setCurrentCoordinates] = useState();

    const [map, setMap] = React.useState(null);

    const onLoad = React.useCallback(function callback(map) {
        navigator.geolocation.getCurrentPosition((position) => {
            let lat = position.coords.latitude;
            let lng = position.coords.longitude;
            const cordinates = { lat, lng };
            setCurrentCoordinates(cordinates);
        });
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map);
    }, []);

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null);
    }, []);

    const assignSenderLocation = (e) => {
        const cordinates = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        dispatch(setSenderCoordinates(cordinates));
        fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${e.latLng.lat()}&lon=${e.latLng.lng()}&apiKey=a1dd45a7dfc54f55a44b69d125722fcb`
        )
            .then((res) => res.json())
            .then((data) => setSenderAddress(data.features[0].properties.formatted));
    };

    const assignReceiverLocation = (e) => {
        const cordinates = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        dispatch(setReceiverCoordinates(cordinates));
        fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${e.latLng.lat()}&lon=${e.latLng.lng()}&apiKey=a1dd45a7dfc54f55a44b69d125722fcb`
        )
            .then((res) => res.json())
            .then((data) =>
                setReceiverAddress(data.features[0].properties.formatted)
            );
    };

    return (
        <>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} onLoad={onLoad} onUnmount={onUnmount}>
                {isSenderFormActive ? (
                    <Marker
                        draggable={true}
                        onDragEnd={(e) => assignSenderLocation(e)}
                        icon={{ url: "https://cdn-icons-png.flaticon.com/512/3477/3477419.png", scaledSize: new window.google.maps.Size(40, 40) }}
                        position={senderCoordinates.lat ? senderCoordinates : center}
                    />
                ) : (
                    <Marker
                        draggable={true}
                        onDragEnd={(e) => assignReceiverLocation(e)}
                        icon={{ url: "https://cdn-icons-png.flaticon.com/512/4218/4218645.png", scaledSize: new window.google.maps.Size(37, 37) }}
                        position={receiverCoordinates.lat ? receiverCoordinates : center}
                    />
                )}

                {/* Child components, such as markers, info windows, etc. */}
            </GoogleMap>
        </>
    )
};

export default React.memo(SendOrders);