import React, { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";

function DashboardTopBar({ updateDashboardPeriod }) {
    // Initial date range for current year
    const currentYear = new Date().getFullYear();
    const defaultDateValue = {
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`
    };
    const [dateValue, setDateValue] = useState(defaultDateValue);

    // Handle date range change from datepicker
    const handleDateChange = (newValue) => {
        // Check if newValue is null and reset to default
        if (!newValue.startDate || !newValue.endDate) {
            setDateValue(defaultDateValue);
            updateDashboardPeriod({
                start: `${defaultDateValue.startDate}T00:00:00`,
                end: `${defaultDateValue.endDate}T23:59:59`
            });
        } else {
            setDateValue(newValue);
            updateDashboardPeriod({
                start: `${newValue.startDate}T00:00:00`,
                end: `${newValue.endDate}T23:59:59`
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <h2 className="text-xl font-semibold mb-4 md:mb-0">Dashboard Analytics</h2>

                <div className="w-full md:w-72">
                    <Datepicker
                        value={dateValue}
                        onChange={handleDateChange}
                        showShortcuts={true}
                        primaryColor="blue"
                        inputClassName="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

export default DashboardTopBar;