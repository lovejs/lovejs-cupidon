import React from "react";
import _ from "lodash";
import queryString from "query-string";
import { withRouter } from "react-router";

import Panel from "components/Panel/Panel";

import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";

import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";

import AccountCircle from "@material-ui/icons/AccountCircle";
import SwipeableViews from "react-swipeable-views";

const styles = {
    tags: {
        listStyleType: "none",
        padding: 0
    }
};

class LoveExtensionComponent extends React.Component {
    constructor(props) {
        super(props);

        let search_service = null;
        const params = queryString.parse(props.location.search);
        if (params.service) {
            search_service = params.service;
        }

        this.state = {
            panel: 0,
            usage: {},
            data: {
                love: {},
                services: [],
                plugins: []
            },
            search_service
        };
    }

    componentDidMount() {
        this.props.emitter.on(this.handleMessage);
        this.refreshData();
    }

    componentWillUnmount() {
        this.props.emitter.off(this.handleMessage);
    }

    handleMessage = usage => {
        this.setState({ usage });
    };

    refreshData() {
        this.props.api("initial").then(res => {
            if (res && res.data) {
                this.setState({ data: res.data });
            }
        });
    }

    handleSearchService = event => {
        this.setState({ search_service: event.target.value });
    };

    handleChangePanel = (event, panel) => {
        this.setState({ panel });
    };

    handleChangePanelIndex = index => {
        this.setState({ panel: index });
    };

    serviceMatch = service => {
        if (!this.state.search_service) {
            return true;
        }
        let search = this.state.search_service.toLowerCase().trim();
        let serviceId = service.id.toLowerCase();

        if (search[0] === "@") {
            return search.slice(1) === serviceId;
        }

        return serviceId.indexOf(search) != -1;
    };

    render() {
        const { classes } = this.props;
        const {
            data: { love, services, plugins },
            usage,
            panel,
            search_service
        } = this.state;

        const mb = mb => `${Math.round(mb / 1024 / 1024, 2)} MB`;

        const serviceFrom = service => {
            switch (service.type) {
                case "factory":
                    return (
                        <span>
                            {service.from.service}.{service.from.method}()
                        </span>
                    );
                default:
                    return service.from;
            }
        };

        const serviceTags = service => {
            if (!service.tags) return "";
            return (
                <ul className={classes.tags}>
                    {service.tags.map((tag, idx) => (
                        <li key={`tag${idx}`}>
                            <strong>{tag.name}</strong> {tag.data && `(${_.map(tag.data, (v, k) => `${k}: ${v}`).join(", ")})`}
                        </li>
                    ))}
                </ul>
            );
        };

        return (
            <Grid container spacing={16}>
                <Grid item md={4}>
                    {love && (
                        <Panel title="LoveJs" color="red">
                            <List dense={true}>
                                <ListItem>
                                    <ListItemText primary={love.version} secondary="Version" />
                                </ListItem>
                            </List>
                        </Panel>
                    )}
                    {usage && (
                        <Panel title="Memory Usage" color="blue">
                            <List dense={true}>
                                <ListItem>
                                    <ListItemText primary={mb(usage.heapUsed)} secondary="Heap Used" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={mb(usage.heapTotal)} secondary="Heap Total" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary={mb(usage.rss)} secondary="Resident Set Size" />
                                </ListItem>
                            </List>
                        </Panel>
                    )}

                    <Panel title="Plugins" color="orange">
                        <List dense={true}>
                            {plugins.map(plugin => (
                                <ListItem key={plugin.name}>
                                    <ListItemText primary={plugin.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Panel>
                </Grid>
                <Grid item md={8}>
                    <Panel title="Services" color="purple">
                        <Tabs value={panel} onChange={this.handleChangePanel} indicatorColor="primary" textColor="primary" fullWidth>
                            <Tab label="Services" />
                            <Tab label="Something else" />
                        </Tabs>
                        <SwipeableViews axis="x" index={panel} onChangeIndex={this.handleChangePanelIndex}>
                            <div style={{ padding: 8 * 3 }}>
                                <TextField label="Search service..." onChange={this.handleSearchService} defaultValue={search_service} />
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Service</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>From</TableCell>
                                            <TableCell>Tags</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {services.filter(service => this.serviceMatch(service)).map(service => {
                                            const { id, type } = service;
                                            return (
                                                <TableRow key={service.id}>
                                                    <TableCell>{id}</TableCell>
                                                    <TableCell>{type}</TableCell>
                                                    <TableCell>{serviceFrom(service)}</TableCell>
                                                    <TableCell>{serviceTags(service)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                            <div style={{ padding: 8 * 3 }}>More stuff</div>
                        </SwipeableViews>
                    </Panel>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(withRouter(LoveExtensionComponent));

export const getServiceLink = service => {
    return { pathname: "/love", search: `?service=@${service}` };
};
