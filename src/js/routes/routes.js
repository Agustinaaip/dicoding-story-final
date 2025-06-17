import HomeView from "../views/home/home-view";
import AboutView from "../views/about/about-view";
import StoryView from "../views/story/story-view";
import AddStoryView from "../views/story/add-story-view";
import DetailStoryView from "../views/story/detail-story-view";
import LoginView from "../views/auth/login-view";
import SigninView from "../views/auth/signin-view";
import SavedStoryView from "../views/story/save-story-view";

const routes = {
  "/": new HomeView(),
  "/about": new AboutView(),
  "/story": new StoryView(),
  "/story/add": new AddStoryView(),
  "/story/:id": new DetailStoryView(),
  "/login": new LoginView(),
  "/signin": new SigninView(),
  "/saved-stories": new SavedStoryView(),
};

const matchRoute = (path) => {
  if (routes[path]) {
    return routes[path];
  }

  if (path.startsWith("/story/") && path.split("/").length === 3) {
    if (path !== "/story/add") {
      return routes["/story/:id"];
    }
  }

  return null;
};

export { routes as default, matchRoute };

function extractPathnameSegments(path) {
  const splitUrl = path.split("/");
  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = "";

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id && pathSegments.resource === "story") {
    if (pathSegments.id !== "add") {
      pathname = pathname.concat("/:id");
    } else {
      pathname = pathname.concat("/add");
    }
  }

  return pathname || "/";
}

export function getActivePathname() {
  return location.hash.replace("#", "") || "/";
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
