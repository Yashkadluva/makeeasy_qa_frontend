import moment from "moment";
const HelperService = {
  allowOnlyNumericValue(e: any) {
    var numbers = /^[0-9]$/;
    if (!e.key.match(numbers) && e.keyCode != 8) {
      e.preventDefault();
      return false;
    }

    if (e.currentTarget.value.length > 11) {
      e.preventDefault();
      return false;
    }
  },

  maxNumber(e: any, maxNumber: number) {
    if (maxNumber && e.currentTarget.value.length > maxNumber) {
      e.preventDefault();
      return false;
    }
  },

  contactFormatter: function (e: any) {
    if (e.currentTarget.value) {
      e.currentTarget.value = this.getFormattedContact(
        e.currentTarget.value ? e.currentTarget.value.replaceAll("-", "") : ""
      );
    }
  },

  allowNewDecimalValue(e: any) {
    let keyCode = e.keyCode ? e.keyCode : e.which;
    if (
      (keyCode < 48 || keyCode > 57) &&
      (keyCode != 46 || e.target.value.indexOf(".") != -1)
    ) {
      e.preventDefault();
      return false;
    }
    if (
      e.target.value != null &&
      e.target.value.indexOf(".") > -1 &&
      e.target.value.split(".")[1].length > 1 &&
      (e.target.selectionStart == e.target.value.length ||
        e.target.selectionStart == e.target.value.length - 1 ||
        e.target.selectionStart == e.target.value.length - 2)
    ) {
      e.preventDefault();
      return false;
    }
  },

  formateDecimal(value: any) {
    return value ? parseFloat(value).toFixed(2) : "";
  },

  formateUptoTwoDecimal(e: any) {
    if (e && e.target) {
      e.currentTarget.value = this.formateDecimal(e.target.value);
    }
  },

  isValidEmail(email: string) {
    return email
      ? /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
      : true;
  },

  getFormattedContact: function (e: any) {
    if (e) {
      const match = e.replace(/\D+/g, "");
      const part1 = match.length > 2 ? `${match.substring(0, 3)}` : match;
      const part2 = match.length > 3 ? `-${match.substring(3, 6)}` : "";
      const part3 = match.length > 6 ? `-${match.substring(6, 10)}` : "";
      var x = part1 + "" + part2 + "" + part3;
      return x;
    } else {
      return e;
    }
  },

  timeFormatter: function (e: any) {
    if (e.currentTarget.value) {
      e.currentTarget.value = this.getFormattedTime(
        e.currentTarget.value ? e.currentTarget.value.replaceAll(":", "") : ""
      );
    }
  },

  getFormattedTime: function (e: any) {
    if (e) {
      const match = e.replace(/\D+/g, "");
      const part1 = match.length > 1 ? `${match.substring(0, 2)}` : match;
      const part2 = match.length > 2 ? `:${match.substring(2, 4)}` : "";
      var part3 = "";
      if ((e.length >= 4 && e.includes('p')) || (e.length >= 4 && e.includes('P'))) {
        var part3 = " PM"
      } else if ((e.length >= 4 && e.includes('a')) || (e.length >= 4 && e.includes('A'))) {
        var part3 = " AM"
      }
      var x = part1 + "" + part2 + "" + part3;
      return x;
    } else {
      return e;
    }
  },

  getCurrencyFormatter: function (e: any) {
    if (e || e == 0) {
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(e);
    } else {
      return e;
    }
  },

  currencyFormat: function (e: any) {
    e.currentTarget.value = this.formatAmount(
      e.currentTarget.value ? e.currentTarget.value.replaceAll(",", "") : ""
    );
  },

  formatAmount: function (e: any) {
    if (e > 0) {
      var numb =
        e.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") +
        (e.indexOf(".") == -1 ? ".00" : "");
      return numb;
    } else {
      return "";
    }
  },

  getFormatedDateInUs(d: any) {
    return d ? moment.utc(d).format("MM-DD-YY") : "";
  },

  getFormatedDate(d: any) {
    return d ? moment.utc(d).format("MM/DD/YY") : "";
  },

  getFormatedDatebyYYYY(d: any) {
    return d ? moment.utc(d).format("MM/DD/YYYY") : "";
  },

  getFormatedDateWithYear(d: any) {
    return d ? moment.utc(d).format("YYYY-MM-DD") : "";
  },

  getFormatedDateandYear(d: any) {
    return d ? moment.utc(d).format("YYYY-M-D") : "";
  },

  getFormatedDateAndTime(dt: any) {
    return moment.utc(dt).format("MM/DD/YY, hh:mm A");
  },

  getFormatedDateAndTimeWithoutUTC(dt: any) {
    return moment(dt).format("MM/DD/YY, hh:mm A");
  },

  getFormatedDateForTimePicker(dt: any) {
    return moment.utc(dt).format("YYYY-MM-DD hh:mm:ss");
  },

  getFormatedDateForSorting(dt: any) {
    if (dt) {
      return moment(dt).format("YYYY-MM-DD");
    }
  },

  getFormatedDateForDetail(dt: any) {
    if (dt) {
      return moment(dt).format("YYYY-M-D");
    }
  },

  getFormateTimeFromTime(t: any) {
    return moment(t, 'hh:mm A').format("HH:mm:ss");
  },

  getFormatedTime(d: any) {
    return d ? moment.utc(d).format("hh:mm A") : "";
  },

  getFormatedDateWithoutUTC(dt: any) {
    return moment(dt).format("YYYY-MM-DD hh:mm:ss");
  },

  getFormatedTimeWithoutUTC(d: any) {
    return d ? moment(d).format("hh:mm A") : "";
  },

  getFormatedTimeWithSecond(d: any) {
    return d ? moment.utc(d).format("hh:mm:ss") : "";
  },

  getFormatedDays(dt: any) {
    return moment.utc(dt).format("dddd");
  },

  removeHtml(data: string) {
    if (data) {
      return data
        .replace(/<\/?[^>]+(>|$)/g, " ")
        .replace(/\&nbsp;/g, "")
        .replaceAll("&amp;", "&")
        .replaceAll("&quot;", '"')
        .replaceAll("&#39;", "'")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .trim();
    }

    return "";
  },

  isEmptyObject(data: object) {
    return Object.keys(data).length === 0;
  },

  getString(data: string, size: number) {
    if (data.length > size - 3) {
      return data.substring(0, size - 3) + "...";
    }

    return data;
  },

  validCreditCard(number: any) {
    var data = number.replaceAll("-", "");
    var isValid = "";
    var visaRegEx = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
    var mastercardRegEx = /^(?:5[1-5][0-9]{14})$/;
    var amexpRegEx = /^(?:3[47][0-9]{13})$/;
    var discovRegEx = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
    if (visaRegEx.test(data)) {
      isValid = "VISA";
    } else if (mastercardRegEx.test(data)) {
      isValid = "MASTERCARD";
    } else if (amexpRegEx.test(data)) {
      isValid = "AMERICANEXPRESS";
    } else if (discovRegEx.test(data)) {
      isValid = "DISCOVERCARD";
    }
    return isValid;
  },

  formatCreditCard: function (e: any) {
    if (e.currentTarget.value) {
      e.currentTarget.value = this.getformatCreditCard(
        e.currentTarget.value ? e.currentTarget.value.replaceAll("-", "") : ""
      );
    }
  },

  getCompanyIcon: function (e: any) {
    if (e) {
      let logo = e.toUpperCase().split(" ");
      if (logo.length >= 2) {
        return `${logo[0].charAt(0)}${logo[1].charAt(0)}`;
      } else if (logo.length == 1) {
        return `${logo[0].charAt(0)}${logo[0].charAt(1)}}`;
      } else {
        return "";
      }
    }
  },

  getTimes(startTime: any, endTime: any, interval: number) {
    let allTimes = [];
    while (startTime < endTime) {
      allTimes.push(startTime.format("YYYY-MM-DD HH:mm:ss"));
      startTime.add(interval, "minutes");
    }

    return allTimes;
  },

  getformatCreditCard(e: any) {
    if (e) {
      const match = e.replace(/\D+/g, "");
      const part1 = match.length > 3 ? `${match.substring(0, 4)}` : match;
      const part2 = match.length > 4 ? `-${match.substring(4, 8)}` : "";
      const part3 = match.length > 8 ? `-${match.substring(8, 12)}` : "";
      const part4 = match.length > 12 ? `-${match.substring(12, 16)}` : "";
      var x = part1 + "" + part2 + "" + part3 + "" + part4;
      return x;
    } else {
      return e;
    }
  },

  getShadeColor(color: string, percent: any) {
    return (
      "#" +
      color
        .replace(/^#/, "")
        .replace(/../g, (color) =>
          (
            "0" +
            Math.min(255, Math.max(0, parseInt(color, 16) + percent)).toString(
              16
            )
          ).substr(-2)
        )
    );
  },

  getFromThen(value: any) {
    if (value) {
      var text = value.split(" ")
      var str = '';
      var isAdd = false;
      if (text.length > 0) {
        for (var i in text) {
          if (text[i] == 'then') {
            isAdd = true
          }
          if (isAdd) {
            str += `${text[i]} `
          }
        }
      }
      return str;
    }
  }
};

export const search_criteria = "4";
export const search_field = "Name";

export default HelperService;

export const getCurrentPage = (url: string) => {
  if (url === "/dashboard") {
    return "Dashboard";
  } else if (
    url === "/service-master" ||
    url === "/SM" ||
    url === "/invoice-entry"
  ) {
    return "Service";
  } else if (url === "/comapany-information") {
    return "Admin";
  } else if (url === "/basic-view" || url === "/horizontal-view" || url === "/vertical-view" || url === "/multiday-view") {
    return "Dispatch Board";
  } else if (url === "/reports") {
    return "Reports";
  } else {
    return "Dashboard";
  }
};
