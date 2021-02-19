import React, { useState } from 'react'
import { HTMLTable, Text, Colors } from '@blueprintjs/core'
import { useHistory } from 'react-router-dom'

type MsgType = "MODE" | "ACTION" | "TOPIC" | "KICK"
	     | "PART" | "NICK" | "PRIVMSG" | "QUIT" | "JOIN"

interface Message {
    id: number
    msg_type: MsgType
    sender: string
    content: string
    time: number
}

function padStart(str: string, len: number, padding: string) {
    // I should probably add left-padding as dependency (w)
    return (padding + str).slice(str.length - len + padding.length, str.length + padding.length)
}

function Message(message: Message) {
    switch (message.msg_type) {
	case "MODE":
	    return (
		<div>
			<i>*MODE {message.content}</i>
		</div>
	    )
	case "ACTION":
	    return (
		<div>
		    * <i>{message.content}</i>
		</div>
	    )
	case "TOPIC":
	    return (
		<div>
		{message.content}
		</div>
	    )
	case "KICK":
	    return (
		<div>
		    <i>kicked {message.content}</i>
		</div>
	    )
	case "PART":
	    return (
		<div>
		    <i>left channel: {message.content}</i>
		</div>
	    )
	case "NICK":
	    return (
		<div>
		    <i>is now known as <b>{message.content}</b></i>
		</div>
	    )
	case "JOIN":
	    return (
		<div>
		    <i>joined us.</i>
		</div>
	    )
	case "QUIT":
	    return (
		<div>
		    <i>go offline: {message.content}</i>
		</div>
	    )
	case "PRIVMSG":
	    return (
		<div>
		{message.content}
		</div>
	    )
    }
}

interface MessageListEntryProps {
    msg: Message
    dateStyle?: "short" | "full"
    scrollTarget?: boolean
    clickable?: boolean
}

interface GroupedMessage {
    date: Date
    messages: Message[]
}

function groupByDate(msgs: Message[]): GroupedMessage[] {
    let ret = []

    for (const m of msgs) {
	if (!ret.length) {
	    ret.push({ date: new Date(m.time * 1000), messages: [m] })
	    continue
	}

	let lastDate = ret[ret.length - 1].date
	let date = new Date(m.time * 1000)
	if (lastDate.getFullYear() == date.getFullYear()
	    && lastDate.getMonth() == date.getMonth()
	    && lastDate.getDay() == date.getDay()) {
	    ret[ret.length - 1].messages.push(m)
	} else {
	    ret.push({ date: date, messages: [m] })
	}
    }

    return ret;
}

function MessageListEntry(props: MessageListEntryProps) {
    let history = useHistory()

    let ref = React.createRef<HTMLTableRowElement>()

    let [scrollTarget, setScrollTarget] = React.useState(props.scrollTarget)
    let clickable = React.useState(props.clickable || scrollTarget)[0]

    const onClick = () => {
	if (clickable) {
	    history.push(`/c_lang_cn/logs?ts=${props.msg.id}&ref=${props.msg.id}`)
	} else {
	    setScrollTarget(false)
	}
    }

    React.useEffect(() => {
	if (!props.scrollTarget) return
	ref.current?.scrollIntoView({ behavior: 'smooth', block: "center" })
    })

    let date = new Date(props.msg.time * 1000)
    let datetime_text
    if (props.dateStyle == "full") {
	let year = date.getFullYear().toString()
	let month = padStart(date.getMonth().toString(), 2, "00")
	let day = padStart(date.getDay().toString(), 2, "00")
	let hour = padStart(date.getHours().toString(), 2, "00")
	let minute = padStart(date.getMinutes().toString(), 2, "00")
	datetime_text = `${year}/${month}/${day} ${hour}:${minute}`
    } else {
	let hour = padStart(date.getHours().toString(), 2, "00")
	let minute = padStart(date.getMinutes().toString(), 2, "00")
	datetime_text = `${hour}:${minute}`
    }

    return (
	<div className="msglist-entry">
	    <div className="msglist-entry-datetime">{datetime_text}</div>
	    <div className="msglist-entry-sender">{props.msg.sender}</div>
	    <div className="msglist-entry-content">{Message(props.msg)}</div>
	</div>
    )
}

interface MessageListProps {
    startTime: number
    scrollTo?: number
}

async function fetchMessages(time: number, limit: number = 500)
{
    let res = await fetch(`/api/list?time=${time}&limit=${limit}`)
    let json = await res.json()
    return json.result as Message[]
}

async function fetchMessagesBackwards(time: number, limit: number = 500)
{
    let res = await fetch(`/api/list_backwards?time=${time}&limit=${limit}`)
    let json = await res.json()
    return json.result as Message[]
}


interface MessageListTableProps {
    date: Date
    messages: Message[]
}

function MessageListTable(props: MessageListTableProps) {
    return (
	<>
	<div className="msglist-entry">
	<span className="msglist-date-span">
		Chat logs for {props.date.getFullYear()}-{props.date.getMonth()+1}-{props.date.getDate()}
	</span>
	</div>
	{props.messages.map(m => <MessageListEntry msg={m} key={m.id} />)}
	</>
    )
}

function haveDups(messages: Message[], m: Message): boolean {
    if (!messages.length) {
	return false;
    }

    if (m.time != messages[messages.length - 1].time)  {
	return false;
    }

    for (let i = messages.length - 1; i >= 0; --i) {
	if (m.time != messages[i].time) {
	    return false;
	}

	if (m.id == messages[i].id) {
	    return true;
	}
    }

    return false;
}

export function MessageList(props: MessageListProps) {
    let [loading, setLoading] = useState<null | "next" | "prev">("next")
    let [messages, setMessages] = useState<Message[]>([])

    React.useEffect(() => {
	(async () => {
	    if (messages.length)
		return;
	    let ret = await fetchMessages(props.startTime)
	    if (!ret.length) {
		ret = await fetchMessagesBackwards(props.startTime)
	    }

	    setLoading(null)
	    setMessages(ret)
	})()
    })

    const loadingMore = <div className="msglist-loading" style={{ textAlign: "center" }}><Text>Loading more...</Text></div>

    const loadPrevMore = async () => {
	let msgs = messages
	setLoading("prev")

	let newMsgs = await fetchMessagesBackwards(msgs[0].time)

	for (let m of msgs) {
	    if (!haveDups(newMsgs, m)) {
		newMsgs.push(m)
	    }
	}

	setLoading(null)
	setMessages(newMsgs)
    }

    const loadMore = async () => {
	let msgs = messages
	setLoading("next")

	let newMsgs = await fetchMessages(msgs[msgs.length - 1].time)

	for (let m of newMsgs) {
	    if (!haveDups(msgs, m)) {
		msgs.push(m)
	    }
	}

	setLoading(null)
	setMessages(msgs)
    }

    let prev = <div className="msglist-entry"><a onClick={loadPrevMore} className="msglist-prev">Load previous messages</a></div>
    let next = <div className="msglist-entry"><a onClick={loadMore} className="msglist-next">Load more messages</a></div>
    if (loading == "prev") {
    prev = loadingMore;
    } else if (loading == "next") {
    next = loadingMore;
    }

    let grouped = groupByDate(messages)

    return (
	<div className="msglist-wrapper">
	    <div className="msglist-entry-table">
		{prev}
		{grouped.map(g => <MessageListTable date={g.date} messages={g.messages} />)}
		{next}
	    </div>
	</div>
    )
}

interface MessageSearchProps {
    query: string
}

export function MessageSearch(_props: MessageSearchProps) {
    return <></>
}
