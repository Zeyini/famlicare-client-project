import { select, call, put, takeLatest } from "redux-saga/effects";
import {
  CREATE_LOVED_ONE_REQUEST,
  CREATE_LOVED_ONE_SUCCESS,
  CREATE_LOVED_ONE_FAILURE,
  UPDATE_LOVED_ONE_REQUEST,
  UPDATE_LOVED_ONE_SUCCESS,
  UPDATE_LOVED_ONE_FAILURE,
  GET_LOVED_ONE_REQUEST,
  GET_LOVED_ONE_SUCCESS,
  GET_LOVED_ONE_FAILURE,
  REMOVE_LOVED_ONE_REQUEST,
  REMOVE_LOVED_ONE_SUCCESS,
  REMOVE_LOVED_ONE_FAILURE,
  AUTHORIZATION_FAILURE,
  STORE_LOVED_ONE_NAME_INFO_REQUEST,
  STORE_LOVED_ONE_NAME_INFO_SUCCESS,
  STORE_LOVED_ONE_NAME_INFO_FAILURE,
  STORE_LOVED_ONE_ADDRESS_INFO_REQUEST,
  STORE_LOVED_ONE_ADDRESS_INFO_SUCCESS,
  STORE_LOVED_ONE_ADDRESS_INFO_FAILURE,
  STORE_LOVED_ONE_DETAIL_INFO_REQUEST,
  STORE_LOVED_ONE_DETAIL_INFO_SUCCESS,
  STORE_LOVED_ONE_DETAIL_INFO_FAILURE,
} from "../reducers/actions/lovedOne.actions.js";
import {
  getLovedOneApi,
  createLovedOneApi,
  updateLovedOneApi,
  removeLovedOneApi,
} from "./api/lovedOne.api";


// Centralized error handling function for sagas
// Logs error to console and dispatches appropriate failure action
// If error is 401 (Unauthorized), dispatches AUTHORIZATION_FAILURE action
function* handleError(error, failureAction) {
  console.error("Saga error:", error); // Log error for debugging
  if (error.response && error.response.status === 401) {
    // Handle unauthorized errors specifically
    yield put({ type: AUTHORIZATION_FAILURE, error });
  } else {
    // Handle other errors
    yield put({ type: failureAction, error });
  }
}

// Saga to handle creation of a loved one
// Dispatches success or failure actions based on API call result
function* createLovedOneSaga(action) {
  try {
    const response = yield call(createLovedOneApi, action.payload);
    // Check if the response is undefined
    if (response === undefined) {
      console.error("API response is undefined.");
      yield put({
        type: CREATE_LOVED_ONE_FAILURE,
        error: "API response is undefined",
      });
      return; // Exit the saga if the response is undefined
    }

    console.log("API response: ", response.data);

    if (response.data && typeof response.data === "object") {
      const lovedOneData = response.data;

      if ("id" in lovedOneData || "lovedOneId" in lovedOneData) {
        const lovedOneId = lovedOneData.id || lovedOneData.lovedOneId;
        const first_name = lovedOneData.first_name;
        const last_name = lovedOneData.last_name;

        if (first_name && last_name) {
          yield put({
            type: CREATE_LOVED_ONE_SUCCESS,
            payload: { lovedOneId, first_name, last_name },
          });
        } else {
          console.error(
            "Missing first_name or last_name in API response:",
            lovedOneData
          );
          yield put({
            type: CREATE_LOVED_ONE_FAILURE,
            error: "Missing data in API response",
          });
        }
      } else {
        console.error("Missing id/lovedOneId in API response:", lovedOneData);
        yield put({
          type: CREATE_LOVED_ONE_FAILURE,
          error: "Missing id in API response",
        });
      }
    }
  } catch (error) {
    yield* handleError(error, CREATE_LOVED_ONE_FAILURE);
  }
}

// Saga to handle updates to a loved one

// Selector to get lovedOneId from the state
const getLovedOneId = state => state.lovedOne.id;

function* updateLovedOneSaga(action) {
  try {
    // Retrieve lovedOneId from the state
    const stateLovedOneId = yield select(getLovedOneId);
    // Validate the stateLovedOneId just like the payload's lovedOneId
    // Ensure it's not null and is a valid integer
    // If validation fails, use yield put to dispatch failure action

    // Assuming validation passed and stateLovedOneId is used:
    const { ...updates } = action.payload;
    const payloadForAPI = { loved_one_id: stateLovedOneId, ...updates };

    // Use the structured payload in the API call
    const response = yield call(updateLovedOneApi, stateLovedOneId, payloadForAPI);

    // Dispatch the success action with the updated loved one data
    yield put({ type: UPDATE_LOVED_ONE_SUCCESS, payload: response.data });
  } catch (error) {
    yield* handleError(error, UPDATE_LOVED_ONE_FAILURE);
  }
}

// Saga to fetch details of a loved one
// Dispatches success or failure actions based on API call result
function* getLovedOneSaga(action) {
  try {
    const response = yield call(getLovedOneApi, action.payload);
    yield put({ type: GET_LOVED_ONE_SUCCESS, payload: response.data });
  } catch (error) {
    yield* handleError(error, GET_LOVED_ONE_FAILURE);
  }
}

// Saga to handle removal of a loved one
// Similar structure to other sagas, dispatches success or failure based on API call
function* removeLovedOneSaga(action) {
  try {
    const response = yield call(removeLovedOneApi, action.payload);
    // The API response only includes a success message, so we don't need to pass any payload
    yield put({ type: REMOVE_LOVED_ONE_SUCCESS });
  } catch (error) {
    yield* handleError(error, REMOVE_LOVED_ONE_FAILURE);
  }
}

// Root saga that listens for actions and delegates to specific sagas
// Using takeLatest to cancel any ongoing saga if the action is dispatched again
export default function* rootSaga() {
  yield takeLatest(CREATE_LOVED_ONE_REQUEST, createLovedOneSaga);
  yield takeLatest(UPDATE_LOVED_ONE_REQUEST, updateLovedOneSaga);
  yield takeLatest(GET_LOVED_ONE_REQUEST, getLovedOneSaga);
  yield takeLatest(REMOVE_LOVED_ONE_REQUEST, removeLovedOneSaga);
}