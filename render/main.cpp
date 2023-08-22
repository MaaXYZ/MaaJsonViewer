#include <emscripten.h>
#include <emscripten/bind.h>
#include <stdio.h>

struct Edge {
  int from, to;
};

int main() {}

template <typename T>
std::vector<T> convertToVector(const emscripten::val &arr) {
  std::vector<T> vec;
  for (size_t i = 0; i < arr["length"].as<size_t>(); ++i) {
    vec.push_back(arr[i].as<T>());
  }
  return vec;
}

void layoutGraph(int n, const emscripten::val &v_edges) {
  auto edgeVerts = convertToVector<int>(v_edges);
  std::vector<Edge> edges;

  for (int idx = 0; idx + 1 < edgeVerts.size(); idx += 2) {
    int from = edgeVerts[idx];
    int to = edgeVerts[idx + 1];
    if (from < 0 || from >= n || to < 0 || to >= n) {
      continue;
    }
    edges.emplace_back(Edge{from, to});
  }

  for (auto [f, t] : edges) {
    printf("%d -> %d\n", f, t);
  }
}

EMSCRIPTEN_BINDINGS(my_module) {
  emscripten::function("layoutGraph", layoutGraph);
}
