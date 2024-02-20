import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import {
  Container,
  Box,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import {
  createAddress,
  listAddressDetail,
  updateAddress,
} from "../../store/actions/addressActions";

export default function AddressDetails(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const { id, fromdelivery } = useParams();
  const autocomplete = useRef(null);

  const { userInfo } = useSelector((state) => state.userLogin);

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
    }
  }, [userInfo, history]);

  const [formData, setFormData] = useState({
    _id: "",
    user: userInfo._id,
    name: "",
    street_address: "",
    city: "",
    state: "",
    zip_code: "",
    googleMapLink: "",
  });

  const getAddressDetail = useCallback(
    (id) => {
      dispatch(listAddressDetail(id))
        .then((res) => {
          if (res.data) {
            setFormData({
              _id: res.data._id,
              user: res.data.user,
              name: res.data.name,
              street_address: res.data.street_address,
              city: res.data.city,
              state: res.data.state,
              zip_code: res.data.zip_code,
              googleMapLink: res.data.googleMapLink,
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [dispatch]
  );

  useEffect(() => {
    if (props.method !== "Add") {
      getAddressDetail(id);
    }
  }, [id, history, props.method]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Address autocompleting
  const handlePlaceSelect = () => {
    let addressObject = autocomplete.current.getPlace();

    if (addressObject && addressObject.address_components) {
      let address = addressObject.address_components;
      let updatedFormData = { ...formData };

      // updatedFormData.name = recipName;
      updatedFormData.street_address = `${address[0]?.long_name} ${address[1]?.long_name}`;
      updatedFormData.googleMapLink = addressObject.url;

      address.forEach((item) => {
        if (
          item.types[0] === "locality" ||
          item.types[0] === "sublocality_level_1"
        ) {
          updatedFormData.city = item.long_name;
        }
        if (item.types[0] === "country") {
          updatedFormData.state = item.short_name;
        }
        if (item.types[0] === "postal_code") {
          updatedFormData.zip_code = item.long_name;
        }
      });

      setFormData(updatedFormData);
    }
  };

  useEffect(() => {
    autocomplete.current = new window.google.maps.places.Autocomplete(
      document.getElementById("autocomplete"),
      {}
    );
    autocomplete.current.addListener("place_changed", handlePlaceSelect);
  }, [handlePlaceSelect]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (props.method === "Add") {
      dispatch(createAddress(formData));
    } else {
      dispatch(updateAddress(formData));
    }
    if (fromdelivery) {
      history.push("/delivery");
    } else {
      history.push("/account/addressbook");
    }
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      name: "",
      street_address: "",
      city: "",
      state: "",
      zip_code: "",
      googleMapLink: "",
    });
  };

  const toPanelHandler = (e) => {
    e.preventDefault();
    history.push("/account/addressbook");
  };

  return (
    <Container className="account_panel">
      <Box className="create_panel">
        <form onSubmit={handleSubmit}>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="text" onClick={toPanelHandler} color="inherit">
                <Typography variant="h5">
                  <strong>Address Book</strong>
                </Typography>
              </Button>
              <ChevronRightIcon />
              <Button variant="text" color="primary">
                <Typography variant="h5">
                  <strong>
                    {props.method} Address {props.method ? "" : "Details"}
                  </strong>
                </Typography>
              </Button>
            </Stack>
          </Stack>

          <Grid container className="create_panel" spacing={3}>
            <Grid item xs={0} sm={4}></Grid>
            <Grid item xs={12} sm={4}>
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={3}
              >
                <TextField
                  required
                  name="name"
                  label="Recipient name"
                  value={formData.name}
                  placeholder="Name"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: props.method ? false : true,
                  }}
                  onChange={handleChange}
                />
                <TextField
                  id="autocomplete"
                  label="Enter a location"
                  size="small"
                  sx={{ display: props.method ? "block" : "none" }}
                  fullWidth
                />
                <TextField
                  required
                  name="street_address"
                  label="Street address"
                  value={formData.street_address}
                  placeholder="Street Address"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: props.method ? false : true,
                  }}
                  onChange={handleChange}
                />
                <TextField
                  required
                  name="city"
                  label="City"
                  value={formData.city}
                  placeholder="City"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: props.method ? false : true,
                  }}
                  onChange={handleChange}
                />
                <TextField
                  required
                  name="state"
                  label="State"
                  value={formData.state}
                  placeholder="State"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: props.method ? false : true,
                  }}
                  onChange={handleChange}
                />
                <TextField
                  required
                  name="zip_code"
                  label="Zip code"
                  value={formData.zip_code}
                  placeholder="Zip code"
                  size="small"
                  fullWidth
                  InputProps={{ readOnly: props.method ? false : true }}
                  onChange={handleChange}
                />
                {props.method && (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: "25px" }}
                    startIcon={<SaveIcon />}
                  >
                    <span>Save address</span>
                  </Button>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}></Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
}
