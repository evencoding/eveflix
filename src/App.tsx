import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./Components/Header";
import Home from "./Routes/Home";
import Search from "./Routes/Search";
import Tv from "./Routes/Tv";

function App() {
  return (
    <Router>
      <Header />
      <Switch>
        <Route exact path={["/tv", "/tv/:tvId"]}>
          <Tv />
        </Route>
        <Route path={["/search", "/search/:contentId"]}>
          <Search />
        </Route>
        <Route exact path={["/", "/movies/:movieId"]}>
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
