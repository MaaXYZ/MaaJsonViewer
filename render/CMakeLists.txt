cmake_minimum_required(VERSION 3.22)

project(MaaJsonViewer)

set(CMAKE_CXX_STANDARD 20)

add_executable(render main.cpp graph.cpp deringing.cpp layering.cpp layout.cpp)

target_link_libraries(render embind)
