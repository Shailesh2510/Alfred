import { Injectable } from "@nestjs/common";
import * as ExcelJS from "exceljs";
import { OrderDetailsVM } from "../order/vm/order.vm";
import { VoucherCodeVM } from "src/voucher_code/vm/voucher-code.vm";
import {
  calculateTimeDifferenceInMinutes,
  displaySlackOrderCreatedAtDate,
} from "helpers";

@Injectable()
export class ExporterService {
  async getOrderExcelReport(detailedOrderVMs: OrderDetailsVM[], isMerchantExport = false) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Orders");

    const columns = [
      {
        header: "Order date",
        key: "order_date",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Delivery Time(mins)",
        key: "delivered_date",
        width: 20,
        font: { bold: true },
      },
      { header: "ID", key: "id", width: 10, font: { bold: true } },
      { header: "Order ID", key: "guest_id", width: 10, font: { bold: true } },
      { header: "Hotel", key: "hotel_name", width: 20, font: { bold: true } },
      {
        header: "Merchant",
        key: "merchant_name",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Meal Period",
        key: "meal_period",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Order Number",
        key: "order_number",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Order Status",
        key: "order_status",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Order Type",
        key: "order_type",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Client name",
        key: "client_name",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Client phone",
        key: "client_phone",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Voucher code",
        key: "voucher_code",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Receipt amount",
        key: "receipt_amount",
        width: 20,
        font: { bold: true },
      },

      {
        header: "Total net",
        key: "total_net",
        width: 20,
        font: { bold: true },
      },
      { header: "Tax", key: "tax", width: 20, font: { bold: true } },
      { header: "Tip", key: "tip", width: 20, font: { bold: true } },
      {
        header: "Total gross",
        key: "total_gross",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Grand total",
        key: "grand_total",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Delivery fee",
        key: "delivery_fee",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Refund amount",
        key: "refund_amount",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Applied voucher amount",
        key: "applied_voucher_amount",
        width: 20,
        font: { bold: true },
      },

      { header: "Comment", key: "comment", width: 20, font: { bold: true } },
      {
        header: "Room number",
        key: "room_number",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Cancel reason",
        key: "cancel_reason",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Voucher Payee Type",
        key: "voucher_payer",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Voucher Type",
        key: "voucher_type",
        width: 20,
        font: { bold: true },
      },
    ];

    const merchantColumns = columns.filter(column => {
      const merchantKeys = ['order_date', 'delivered_date', 'id', 'guest_id', 'meal_period', 'receipt_amount', 'tax', 'refund_amount', 'comment'];
      return merchantKeys.includes(column.key);
    });

    sheet.columns = isMerchantExport ? merchantColumns : columns;

    const rows = [];

    detailedOrderVMs.forEach((detailedOrderVM) => {
      const deliveredOn = new Date(detailedOrderVM.delivered_on);
      const baseRow = {
        order_date: displaySlackOrderCreatedAtDate(detailedOrderVM.orderDate),
        delivered_date: detailedOrderVM.delivered_on
          ? parseFloat(
              calculateTimeDifferenceInMinutes(
                deliveredOn,
                detailedOrderVM.orderDate
              ).toFixed(2)
            )
          : detailedOrderVM.status,
        id: detailedOrderVM.id,
        guest_id: detailedOrderVM.nonce,
        hotel_name: detailedOrderVM.hotelName,
        merchant_name: detailedOrderVM.merchantName,
        meal_period: detailedOrderVM.mealPeriodName,
        order_number: detailedOrderVM.orderNumber,
        order_status: detailedOrderVM.status,
        order_type: detailedOrderVM.orderType,
        client_name: detailedOrderVM.clientName,
        client_phone: detailedOrderVM.clientNumber,
        voucher_code: detailedOrderVM.voucherCode,
        receipt_amount: +detailedOrderVM.receiptAmount,

        total_net: +detailedOrderVM.totalNet,
        tax: +detailedOrderVM.taxAmount,
        tip: +detailedOrderVM.tip,
        total_gross: +detailedOrderVM.totalGross,
        grand_total: +detailedOrderVM.grandTotal,
        delivery_fee: +detailedOrderVM.deliveryFee,
        refund_amount: isMerchantExport ? (+detailedOrderVM.refundAmount > 0 ? 'True' : 'False') : +detailedOrderVM.refundAmount,
        applied_voucher_amount: +detailedOrderVM.appliedVoucherAmount,

        comment: detailedOrderVM.comment,
        room_number: detailedOrderVM.roomNumber,
        cancel_reason: detailedOrderVM.cancelReason,
        voucher_payer: detailedOrderVM.voucherPayer,
        voucher_type: detailedOrderVM.voucherType,
      };

      if (isMerchantExport) {
        const merchantRow = {};
        merchantColumns.forEach(column => {
          merchantRow[column.key] = baseRow[column.key];
        });
        rows.push(merchantRow);
      } else {
        rows.push(baseRow);
      }
    });

    sheet.addRows(rows);
    // if needed to debug
    // await workbook.xlsx.writeFile('./temp.xlsx');
    return await workbook.xlsx.writeBuffer();
  }

  async getVoucherCodesExport(voucherCodes: VoucherCodeVM[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Voucher Codes");

    sheet.columns = [
      { header: "ID", key: "id", width: 10, font: { bold: true } },
      { header: "Code", key: "code", width: 20, font: { bold: true } },
      {
        header: "Voucher program id",
        key: "voucher_program_id",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Voucher program name",
        key: "voucher_program_name",
        width: 20,
        font: { bold: true },
      },
      { header: "Hotel", key: "hotel_name", width: 20, font: { bold: true } },
      {
        header: "Claimed date",
        key: "claimed_date",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Total amount",
        key: "total_amount",
        width: 20,
        font: { bold: true },
      },
      {
        header: "Amount used",
        key: "amount_used",
        width: 20,
        font: { bold: true },
      },
    ];

    const rows = [];

    voucherCodes.forEach((voucherCodeVM) => {
      rows.push({
        id: voucherCodeVM.id,
        code: voucherCodeVM.code,
        voucher_program_id: voucherCodeVM.voucherProgramId,
        voucher_program_name: voucherCodeVM.voucherProgramName,
        hotel_name: voucherCodeVM.hotelName,
        claimed_date: voucherCodeVM.claimedDate,
        total_amount: voucherCodeVM.totalAmount,
        amount_used: voucherCodeVM.amountUsed,
      });
    });

    sheet.addRows(rows);
    // if needed to debug
    // await workbook.xlsx.writeFile('./temp.xlsx');
    return await workbook.xlsx.writeBuffer();
  }
}
