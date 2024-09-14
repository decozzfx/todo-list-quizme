import { useEffect, useMemo, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Modal,
  Dimensions,
  FlatList,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  DayType,
  MarkedDate,
  MarkedDates,
  TodoListStateType,
  TodoListType,
} from "@/types";
import { Controller, set, useForm } from "react-hook-form";
import { Checkbox, HelperText, TextInput } from "react-native-paper";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { addTodo, deleteTodo, editTodo } from "@/store/todoReducer";
import dayjs from "dayjs";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { schedulePushNotification } from "@/utils/notification";

const screenWidth = Dimensions.get("window").width;

const initialSelectedDate = {
  dateString: dayjs().format("YYYY-MM-DD"),
  day: Number(dayjs().format("D")),
  month: dayjs().month() + 1,
  timestamp: 0,
  year: dayjs().year(),
};

export default function HomeScreen() {
  const dispatch = useDispatch();

  const { todo } = useSelector((state: RootState) => state);

  const [tab, setTab] = useState("monthly");
  const isMonthly = tab === "monthly";
  const [selectedDate, setSelectedDate] =
    useState<DayType>(initialSelectedDate);

  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [modalDatePickerVisible, setModalDatePickerVisible] = useState(false);
  const [marksDate, setMarksDate] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TodoListType>();

  const todoList = useMemo(() => {
    if (isMonthly) {
      const monthlyData = todo.filter(
        (item) => item.date.month === selectedDate?.month
      );
      const markDates = monthlyData.map((item: TodoListType) => ({
        day: item.date.dateString,
        dotColor: item.color,
        marked: true,
        selectedColor: "#2196F3",
        selected:
          selectedDate?.dateString === item.date.dateString ? true : false,
      }));
      markDates.push({
        day: selectedDate?.dateString || "",
        selected: true,
        selectedColor: "#2196F3",
        dotColor: "",
        marked:
          markDates.findIndex(
            (item) => item.day === selectedDate?.dateString
          ) >= 0,
      });
      setMarksDate(markDates);
      return monthlyData;
    } else {
      return todo.filter(
        (item) => item.date.dateString === selectedDate?.dateString
      );
    }
  }, [todo, selectedDate, isMonthly]);

  const uncompletedTodo = todoList.filter((item) => !item.completed);

  const saveTodo = (data: TodoListType) => {
    if (mode === "edit") {
      dispatch(editTodo(data));
    } else {
      dispatch(addTodo({ ...data, date: selectedDate || "" }));
    }
    toggleModalVisible("add");
    reset();
  };

  const onPressDelete = () => {
    dispatch(deleteTodo(getValues("id")));
    toggleModalVisible("add");
    reset();
  };

  function createMarkedDates(dates: MarkedDate[]): MarkedDates {
    const markedDates: MarkedDates = {};

    dates.forEach((date) => {
      const {
        day,
        selected,
        marked,
        selectedColor,
        dotColor,
        activeOpacity,
        disabled,
        disableTouchEvent,
      } = date;
      markedDates[day] = {
        ...(selected && { selected }),
        ...(marked && { marked }),
        ...(selectedColor && { selectedColor }),
        ...(dotColor && { dotColor }),
        ...(activeOpacity !== undefined && { activeOpacity }),
        ...(disabled && { disabled }),
        ...(disableTouchEvent && { disableTouchEvent }),
      };
    });

    return markedDates;
  }

  const handleConfirm = (date: Date) => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    setSelectedDate({
      dateString,
      day: Number(dayjs(date).format("D")),
      month: dayjs(date).month() + 1,
      timestamp: date.getTime(),
      year: dayjs(date).year(),
    });
    toggleDatePickerVisible();
  };

  const toggleModalVisible = (mode: "add" | "edit", item?: TodoListType) => {
    if (mode === "edit") {
      setValue("text", item?.text || "");
      setValue("completed", item?.completed || false);
      setValue("date", item?.date as DayType);
      setValue("color", item?.color || "");
      setValue("id", item?.id);
    }
    setModalVisible((p) => !p);
    setMode(mode);
  };

  const toggleDatePickerVisible = () => {
    setModalDatePickerVisible((p) => !p);
  };

  useEffect(() => {
    if (uncompletedTodo.length > 0) {
      schedulePushNotification("You have uncompleted todo");
    }
  }, [uncompletedTodo]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={Styles.title}>My Todo List</Text>
        <View style={Styles.gapHeight} />
        <View style={Styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setTab("monthly")}
            style={isMonthly ? Styles.buttonTab : Styles.buttonTabInactive}
          >
            <Text
              style={
                isMonthly ? Styles.buttonTabText : Styles.buttonTabTextInactive
              }
            >
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("daily")}
            style={!isMonthly ? Styles.buttonTab : Styles.buttonTabInactive}
          >
            <Text
              style={
                !isMonthly ? Styles.buttonTabText : Styles.buttonTabTextInactive
              }
            >
              Daily
            </Text>
          </TouchableOpacity>
        </View>
        <View style={Styles.gapHeight} />

        {isMonthly ? (
          <View style={{ width: screenWidth * 0.9, marginHorizontal: "auto" }}>
            <Calendar
              onMonthChange={(month: DayType) => setSelectedDate(month)}
              markedDates={createMarkedDates(marksDate)}
              onDayPress={(day: DayType) => setSelectedDate(day)}
            />
            <View style={Styles.gapHeight} />
            <Text style={[Styles.title, { textAlign: "left" }]}>
              This month
            </Text>
            <View style={Styles.gapHeight} />
          </View>
        ) : (
          <>
            <View style={Styles.dailyDateContainer}>
              <Text style={[Styles.dailyCalendarText]}>
                {dayjs(selectedDate?.dateString).format("DD MMM YYYY")}
              </Text>
              <TouchableOpacity
                style={Styles.dailyCalendarButton}
                onPress={toggleDatePickerVisible}
              >
                <Ionicons name="calendar" size={24} color="gray" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <FlatList
          data={todoList}
          style={{ width: screenWidth * 0.9, marginHorizontal: "auto" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => toggleModalVisible("edit", item)}
              style={Styles.todoCardContainer}
            >
              <View style={Styles.todoCardLeft}>
                <Ionicons
                  size={24}
                  color={item.completed ? "green" : "gray"}
                  name={"checkmark-circle"}
                />
                <Text
                  style={[
                    Styles.todoCardText,
                    {
                      textDecorationLine: item.completed
                        ? "line-through"
                        : "none",
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
              <Text style={Styles.todoCardText}>{item.date.dateString}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center" }}>There is no todo</Text>
          }
        />

        <View style={Styles.addButtonContainer}>
          <Ionicons
            onPress={() => toggleModalVisible("add")}
            size={70}
            color="#2196F3"
            name="add-circle"
          />
        </View>
      </SafeAreaView>

      {/* Form Modal */}
      <Modal
        statusBarTranslucent
        animationType="slide"
        transparent
        visible={modalVisible}
      >
        <View style={Styles.centeredView}>
          <View style={Styles.modalView}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Text style={Styles.modalText}>Create Todo</Text>
              {mode === "edit" && (
                <TouchableOpacity onPress={onPressDelete}>
                  <Ionicons name="trash-sharp" color="red" size={24} />
                </TouchableOpacity>
              )}
            </View>

            <View style={Styles.formContainer}>
              <Controller
                control={control}
                name="text"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <>
                    <TextInput
                      style={{ width: "100%" }}
                      mode="outlined"
                      label="Todo"
                      placeholder="Enter your todo"
                      value={value}
                      onChangeText={onChange}
                      error={Boolean(errors.text)}
                    />
                    <HelperText type="error" visible={Boolean(errors.text)}>
                      {errors.text && "Todo is required"}
                    </HelperText>
                  </>
                )}
              />
              <Controller
                control={control}
                name="completed"
                render={({ field: { onChange, value } }) => (
                  <Checkbox.Item
                    label="Completed"
                    status={value ? "checked" : "unchecked"}
                    onPress={() => onChange(!value)}
                  />
                )}
              />
            </View>

            <View style={Styles.buttonModalContainer}>
              <TouchableOpacity
                style={[Styles.buttonModal, Styles.buttonCloseModal]}
                onPress={() => {
                  toggleModalVisible("add");
                  reset();
                }}
              >
                <Text style={Styles.textButtonModal}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[Styles.buttonModal, Styles.buttonCloseModal]}
                onPress={handleSubmit(saveTodo)}
              >
                <Text style={Styles.textButtonModal}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Date Picker */}
      <DateTimePickerModal
        date={
          selectedDate?.timestamp
            ? new Date(selectedDate.timestamp)
            : new Date()
        }
        isVisible={modalDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={toggleDatePickerVisible}
      />
    </>
  );
}

const Styles = StyleSheet.create({
  dailyCalendarText: {
    padding: 10,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 24,
  },
  dailyCalendarButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 1,
  },
  dailyDateContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginVertical: 12,
  },
  todoCardText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  todoCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  todoCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  formContainer: {
    marginBottom: 20,
    width: screenWidth * 0.7,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  gapHeight: { height: 12 },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#697565",
    borderRadius: 100,
    marginHorizontal: "auto",
  },
  buttonTabText: { color: "white", fontWeight: "bold", textAlign: "center" },
  buttonTabTextInactive: {
    color: "gray",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonTab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: 130,
    borderRadius: 100,
    backgroundColor: "#2196F3",
  },
  buttonTabInactive: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: 130,
    borderRadius: 100,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
  },
  buttonModal: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: 100,
  },
  buttonCloseModal: {
    backgroundColor: "#2196F3",
  },
  textButtonModal: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonModalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
