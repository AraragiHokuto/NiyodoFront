import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"

import { BrowserRouter as Router, Switch, Route, Redirect, RouteComponentProps, useHistory, useLocation } from "react-router-dom"
import { Navbar as BPNavbar, Alignment, Button, Text, InputGroup } from "@blueprintjs/core"

import { MessageList, MessageSearch } from "./components/MessageList"
import DateView from "./components/DateView"

import "./style.scss";

interface NavbarProps {
    title: string
}

function Navbar(props: NavbarProps) {
    const history = useHistory()

    const onHome = () => history.push('/')

    return (
	<BPNavbar fixedToTop className="bp3-dark">
	    <BPNavbar.Group align={Alignment.LEFT}>
		<BPNavbar.Heading>Niyodo</BPNavbar.Heading>
		<BPNavbar.Divider />
		<Button className="bp3-minimal" icon="home" text="Home" onClick={onHome} />
		<BPNavbar.Divider />
		<Text>{props.title}</Text>
	    </BPNavbar.Group>
	    <BPNavbar.Group align={Alignment.RIGHT}>
	    </BPNavbar.Group>
	</BPNavbar>
    )
}

interface PageLogParams {
    year: string
    month: string
    day: string
}

function PageLog(props: RouteComponentProps<PageLogParams>) {
    let title = `Chat Log for #c_lang_cn`


    let date = new Date(parseInt(props.match.params.year),
			parseInt(props.match.params.month)-1,
			parseInt(props.match.params.day))

    return (
	<div>
	    <Navbar title={title} />
	<div className="page-wrapper">
	    <div className="date-area">
		<DateView />
	    </div>
	    <div className="msglist-area">
		<MessageList startTime={Math.floor((+date)/1000)} key={props.location.pathname}/>
	    </div>
	</div>
	</div>
    )
}

export default function App() {
    let today = new Date()
    let y = today.getFullYear()
    let m = today.getMonth()+1
    let d = today.getDate()

    return (
	<Router>
	    <Switch>
		<Route path="/c_lang_cn/:year/:month/:day/" component={PageLog} />
		<Route path="/">
		    <Redirect to={`/c_lang_cn/${y}/${m}/${d}`} />
		</Route>
	    </Switch>
	</Router>
    )
}


ReactDOM.render(
    <App />,
    document.getElementById("container")
)
