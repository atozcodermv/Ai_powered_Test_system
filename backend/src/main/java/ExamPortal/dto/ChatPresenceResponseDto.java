package ExamPortal.dto;

import ExamPortal.entities.CommonApiResponse;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;

@Getter
@Setter
public class ChatPresenceResponseDto extends CommonApiResponse {

    private Map<Integer, Boolean> presenceMap = new LinkedHashMap<>();

}
