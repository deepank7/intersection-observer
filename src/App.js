import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { TailSpin } from "react-loader-spinner";

const allData = new Array(25).fill(0).map((_val, i) => i + 1);
const perPage = 10;
const types = {
  start: "START",
  loaded: "LOADED",
};

const reducer = (state, action) => {
  switch (action.type) {
    case types.start:
      return { ...state, loading: true };
    case types.loaded:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...action.newData],
        more: action.newData.length === perPage,
        after: state.after + action.newData.length,
      };
    default:
      throw new Error("Don't understand action");
  }
};

const MyContext = createContext();

function MyProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, {
    loading: false,
    more: true,
    data: [],
    after: 0,
  });
  const { loading, data, after, more } = state;

  const load = () => {
    dispatch({ type: types.start });

    setTimeout(() => {
      const newData = allData.slice(after, after + perPage);
      dispatch({ type: types.loaded, newData });
    }, 300);
  };

  return (
    <MyContext.Provider value={{ loading, data, more, load }}>
      {children}
    </MyContext.Provider>
  );
}

function App() {
  const { data, loading, more, load } = useContext(MyContext);
  const loader = useRef(load);
  const observer = useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loader.current();
        }
      },
      { threshold: 1 }
    )
  );
  const [element, setElement] = useState(null);

  useEffect(() => {
    loader.current = load;
  }, [load]);

  useEffect(() => {
    const currentElement = element;
    const currentObserver = observer.current;

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [element]);

  return (
    <div className="App">
      <ul>
        {data.map((row) => (
          <li key={row} style={{ background: "orange" }}>
            {row}
          </li>
        ))}

        {loading && (
          <TailSpin color="#00BFFF" height={80} width={80} />
        )}

        {!loading && more && (
          <li ref={setElement} style={{ background: "transparent" }}></li>
        )}
      </ul>
    </div>
  );
}

export default () => {
  return (
    <MyProvider>
      <App />
    </MyProvider>
  );
};
