import { Colors } from "@/constants/colors";
import { DAY_NAMES, MONTH_NAMES } from "@/constants/dateConstants";
import {
    generateCalendarDays,
    isSameDay
} from "@/utils/dateUtils";
import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DatePickerProps {
  visible: boolean;
  value: Date | undefined;
  onChange: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DatePicker({
  visible,
  value,
  onChange,
  onClose,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [month, setMonth] = useState(
    value?.getMonth() ?? new Date().getMonth(),
  );
  const [year, setYear] = useState(
    value?.getFullYear() ?? new Date().getFullYear(),
  );

  const handleDateSelect = (day: number) => {
    const newDate = new Date(year, month, day);
    onChange(newDate);
    onClose();
  };

  const goToPreviousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const days = generateCalendarDays(month, year);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Text style={styles.arrow}>◀</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <TouchableOpacity onPress={goToNextMonth}>
              <Text style={styles.arrow}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Day names */}
          <View style={styles.dayNamesRow}>
            {DAY_NAMES.map((day) => (
              <Text key={day} style={styles.dayName}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days grid */}
          <View style={styles.daysGrid}>
            {days.map((day, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayButton,
                  !day ? styles.dayButtonEmpty : null,
                  day && value && isSameDay(value, new Date(year, month, day))
                    ? styles.dayButtonActive
                    : null,
                ]}
                onPress={() => day && handleDateSelect(day)}
                disabled={!day}
              >
                {day && <Text style={styles.dayText}>{day}</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* OK Button */}
          <TouchableOpacity style={styles.okButton} onPress={onClose}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    width: "85%",
    maxWidth: 320,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  arrow: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  dayNamesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    width: "14.28%",
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dayButton: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  dayButtonEmpty: {
    backgroundColor: "transparent",
  },
  dayButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  okButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  okButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
