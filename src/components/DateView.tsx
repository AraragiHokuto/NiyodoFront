import React from "react"
import { useHistory } from "react-router-dom"
import { Collapse } from "@blueprintjs/core"

import AsyncFetcher from "./AsyncFetcher"

function daysInMonth(year: number, month: number): number {
    let date = new Date(year, month+1, 0)
    return date.getDate()
}

interface MonthListProps {
    startDate: Date
    endDate: Date
    year: number
    month: number
}

function padStart(str: string, len: number, padding: string) {
    // I should probably add left-padding as dependency (w)
    return (padding + str).slice(str.length - len + padding.length, str.length + padding.length)
}

function MonthList(props: MonthListProps) {
    let history = useHistory()
    let [open, setOpen] = React.useState(false)

    let start_day = 1
    let end_day = daysInMonth(props.year, props.month)

    if (props.year == props.startDate.getFullYear()
	&& props.month == props.startDate.getMonth()) {
	start_day = props.startDate.getDate()
    }

    if (props.year == props.endDate.getFullYear()
	&& props.month == props.endDate.getMonth()) {
	end_day = props.endDate.getDate()
    }

    return (
	<div className="date-month-list">
	    <div className="date-month-list-cap" onClick={() => setOpen(!open)}>
		{props.year}-{padStart((props.month+1).toString(), 2, "00")}
	    </div>
	<Collapse isOpen={open}>
	{[...Array(end_day - start_day + 1).keys()].map(i => (
	    <div
		onClick={() => history.push(`/c_lang_cn/${props.year}/${props.month+1}/${i + start_day}`)}
		className="date-month-list-entry">
		{props.year}-{padStart((props.month+1).toString(), 2, "00")}-{padStart((start_day + i).toString(), 2, "00")}
	    </div>
	))}
	</Collapse>
	</div>
    )
}

interface YearListProps {
    startDate: Date
    endDate: Date
    year: number
}

function YearList(props: YearListProps) {
    let [open, setOpen] = React.useState(false)

    let start_month = 0
    let end_month = 11

    if (props.year == props.startDate.getFullYear()) {
	start_month = props.startDate.getMonth()
    }

    if (props.year == props.endDate.getFullYear()) {
	end_month = props.endDate.getMonth()
    }

    return (
	<div className="date-year-list">
	    <div className="date-year-list-cap" onClick={() => setOpen(!open)}>
		{props.year}
	    </div>
	<Collapse isOpen={open}>
	{[...Array(end_month - start_month + 1).keys()].map(i => (
	    <MonthList
		startDate={props.startDate} endDate={props.endDate}
	    year={props.year} month={i + start_month}
	    />
	))}
	</Collapse>
	</div>
    )
}

export default function DateView() {
    const request = async () => {
	let res = await fetch(`/api/list?time=0&limit=1`)
	let body = await res.json()

	let start = body.result[0].time

	return new Date(start * 1000)
    }

    return (
	<AsyncFetcher promise={request()}>
	{
	    res => {
		let start_date = res
		let end_date = new Date()

		let start_year = start_date.getFullYear()
		let end_year = end_date.getFullYear()

		return <div className="date-list">{
		    [...Array(end_year - start_year + 1).keys()].map(i => (
			<YearList startDate={start_date} endDate={end_date}
				  year={start_year+i}
			    />
		    ))
		}</div>
	    }
	}
	</AsyncFetcher>
    )
}
