import React, { useState } from "react";
import {
  IResourceComponentsProps,
  useGetIdentity,
  useTranslate,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  ScrollArea,
  Table,
  Pagination,
  Badge,
  ActionIcon,
  Modal,
  Anchor,
  Flex,
  Group,
} from "@mantine/core";
import {
  List,
  DateField,
  TextField,
  ShowButton,
  DeleteButton,
} from "@refinedev/mantine";
import { IconVaccine } from "@tabler/icons";
import { Job, MatchIndex, Resume, User } from "../interfaces";
import ResumeComponent from "./ResumeComponent";
import MatchIndexModal from "./modal/MatchIndexModal";
import { useNavigate } from "react-router-dom";

export const JobApplicationListComponent: React.FC<
  IResourceComponentsProps
> = () => {
  const translate = useTranslate();
  const { data: user } = useGetIdentity<User>();
  const navigate = useNavigate();

  const [resume, setResume] = useState<Resume>();
  const [resumeOpened, setResumeOpened] = useState(false);
  const [matchOpened, setMatchOpened] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<MatchIndex>({
    overall: 0,
    major: 0,
    degree: 0,
    skill: 0,
    experience: 0,
    education: 0,
    language: 0,
  });

  const handleShowResume = (resume: Resume) => {
    setResume(resume);
    setResumeOpened(true);
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "job",
        header: translate("Job"),
        accessorKey: "job",
        cell: function render({ getValue }) {
          return user?.role === "ADMIN" ? (
            <Flex gap={5}>
              <Anchor
                onClick={() => navigate(`/jobs/show/${getValue<Job>().id}`)}
              >
                <TextField value={getValue<Job>().title} fw={500} />
              </Anchor>
              |
              <Anchor
                onClick={() =>
                  navigate(`/companies/show/${getValue<Job>().company.id}`)
                }
              >
                <TextField value={getValue<Job>().company.name} fw={500} />
              </Anchor>
            </Flex>
          ) : (
            <TextField value={getValue<Job>().title} fz="md" fw={500} />
          );
        },
      },
      {
        id: "resume",
        header: translate("Applicant"),
        accessorKey: "resume",
        cell: function render({ getValue }) {
          return (
            <Anchor onClick={() => handleShowResume(getValue<Resume>())}>
              {" "}
              {getValue<Resume>().fullName}
            </Anchor>
          );
        },
      },
      {
        id: "appliedDate",
        accessorKey: "appliedDate",
        header: translate("Applied Date"),
        cell: function render({ getValue }) {
          return <DateField value={getValue<any>()} />;
        },
      },
      {
        id: "matchingIndex",
        accessorKey: "matchingIndex",
        header: translate("Match Index"),
        cell: function render({ getValue }) {
          return (
            <Anchor
              onClick={() => {
                setCurrentMatchIndex(getValue<any>());
                setMatchOpened(true);
              }}
            >
              <Badge color="red" style={{ fontSize: 16 }}>
                {getValue<any>() ? getValue<any>().overall * 100 : "No Data"}
              </Badge>
            </Anchor>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: translate("Status"),
        cell: function render({ getValue }) {
          return (
            <Badge
              color={
                getValue<string>() === "ACCEPTED"
                  ? "green"
                  : getValue<string>() === "PENDING"
                  ? "blue"
                  : "red"
              }
            >
              {getValue<string>()}
            </Badge>
          );
        },
      },

      {
        id: "actions",
        accessorKey: "id",
        header: translate("table.actions"),
        cell: function render({ getValue }) {
          return user?.role === "ADMIN" ? (
            <Group spacing="xs" noWrap>
              <ShowButton hideText recordItemId={getValue() as string} />
              <DeleteButton hideText recordItemId={getValue() as string} />
            </Group>
          ) : (
            <Group spacing="xs" noWrap>
              <ActionIcon>
                <IconVaccine />
              </ActionIcon>
            </Group>
          );
        },
      },
    ],
    [translate]
  );

  const {
    getHeaderGroups,
    getRowModel,
    refineCore: {
      setCurrent,
      pageCount,
      current,
      tableQueryResult: { data: tableData },
    },
  } = useTable({
    columns,
  });

  return (
    <List>
      <ScrollArea>
        <Table highlightOnHover>
          <thead>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id}>
                      {!header.isPlaceholder &&
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </ScrollArea>
      <br />
      <Pagination
        position="right"
        total={pageCount}
        page={current}
        onChange={setCurrent}
      />

      {/** Display Resume in modal */}
      <Modal
        opened={resumeOpened}
        onClose={() => setResumeOpened(false)}
        title={`${resume?.fullName}'s Resume`}
        size="70%"
      >
        {resume && <ResumeComponent resume={resume} />}
      </Modal>

      {/** Display Radar Chart in modal for Match Index */}
      <MatchIndexModal
        matchOpened={matchOpened}
        setMatchOpened={setMatchOpened}
        currentMatchIndex={currentMatchIndex}
      />
    </List>
  );
};